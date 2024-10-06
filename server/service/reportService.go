package service

import (
	"sort"
	"time"

	"hammond/common"
	"hammond/db"
	"hammond/models"
)

type Range struct {
  Start int
  End   int
}

func ComputeMileage_litre_100km(fillups []db.Fillup, mileages *[]models.MileageModel) {
  var ranges []Range

  // fillups ordered by odo descending
  // travel from lower odo to higher
  for i := len(fillups) - 1; i >= 0; i-- {
		currentFillup := fillups[i]
    currTankFull := currentFillup.IsTankFull != nil && *currentFillup.IsTankFull
    if !currTankFull {
      continue
    }

    for j := i-1; j >= 0; j-- {
      lastFillup := fillups[j]
      lastHasMissed := lastFillup.HasMissedFillup != nil && *lastFillup.HasMissedFillup
      if lastHasMissed {
        i = j + 1 // so that i loop lands on j in the next iter
        break
      }

      lastTankFull := lastFillup.IsTankFull != nil && *lastFillup.IsTankFull
      if lastTankFull {
        ranges = append(ranges, Range{Start: i, End: j})
        i = j + 1
        break
      }
    }
  }

  for _, r := range ranges {
    startFillup := fillups[r.Start]
    endFillup := fillups[r.End]

    mileage := models.MileageModel{
      Date:           startFillup.Date,
      StartDate:      startFillup.Date,
      EndDate:        endFillup.Date,
      VehicleID:      startFillup.VehicleID,
      FuelUnit:       db.LITRE,
      FuelQuantity:   0,
      PerUnitPrice:   startFillup.PerUnitPrice,
      OdoReading:     0,
      DistanceTravel: 0,
      Currency:       startFillup.Currency,
      DistanceUnit:   db.KILOMETERS,
      Mileage:        0,
      CostPerMile:    0,
    }

    // This computes the distance traveled
    startOdo := float32(startFillup.OdoReading)
    endOdo := float32(endFillup.OdoReading)

    // Convert into km if needed
    if startFillup.DistanceUnit != mileage.DistanceUnit {
      startOdo = common.MilesToKm(startOdo)
    }
    if endFillup.DistanceUnit != mileage.DistanceUnit {
      endOdo = common.MilesToKm(endOdo)
    }
    mileage.DistanceTravel = endOdo - startOdo

    // This computes the spent fuel
    // first we convert into Litre
    // reverse order...
    // also should skip start fillup
    for idx := r.Start-1; idx >= r.End; idx-- {
      f := fillups[idx]
      if (f.FuelUnit != mileage.FuelUnit) {
        f.FuelUnit = mileage.FuelUnit
        f.FuelQuantity = common.GallonToLitre(f.FuelQuantity)
      }
      // second sum them all
      mileage.FuelQuantity += f.FuelQuantity
    }
    // third divide
    mileage.Mileage = mileage.FuelQuantity / mileage.DistanceTravel
    mileage.Mileage *= 100
    // forth append
    // append blank
    //  if last date != this date
    //  meaning has missing fillups
    mileagesSize := len(*mileages)
    if mileagesSize > 0 && ((*mileages)[mileagesSize-1].EndDate != mileage.StartDate) {
      blankMileage := models.MileageModel {
        Date:           (*mileages)[mileagesSize-1].EndDate,
        StartDate:      (*mileages)[mileagesSize-1].EndDate,
        EndDate:        mileage.StartDate, 
        VehicleID:      startFillup.VehicleID,
        FuelUnit:       db.LITRE,
        FuelQuantity:   0,
        PerUnitPrice:   startFillup.PerUnitPrice,
        OdoReading:     0,
        DistanceTravel: 0,
        Currency:       startFillup.Currency,
        DistanceUnit:   db.KILOMETERS,
        Mileage:        0,
        CostPerMile:    0,
      }
      *mileages = append(*mileages, blankMileage)
    }
		*mileages = append(*mileages, mileage)
  }
}

func GetMileageByVehicleId(vehicleId string, since time.Time, mileageOption string) (mileage []models.MileageModel, err error) {
	data, err := db.GetFillupsByVehicleIdSince(vehicleId, since)
	if err != nil {
		return nil, err
	}

	fillups := make([]db.Fillup, len(*data))
	copy(fillups, *data)
	sort.Slice(fillups, func(i, j int) bool {
		return fillups[i].OdoReading > fillups[j].OdoReading
	})

	var mileages []models.MileageModel

  if mileageOption == "litre_100km" {
    ComputeMileage_litre_100km(fillups, &mileages)
  } else {

    for i := 0; i < len(fillups)-1; i++ {
      last := i + 1

      currentFillup := fillups[i]
      lastFillup := fillups[last]

      mileage := models.MileageModel{
        StartDate:    currentFillup.Date,
        EndDate:      currentFillup.Date,
        Date:         currentFillup.Date,
        VehicleID:    currentFillup.VehicleID,
        FuelUnit:     currentFillup.FuelUnit,
        FuelQuantity: currentFillup.FuelQuantity,
        PerUnitPrice: currentFillup.PerUnitPrice,
        OdoReading:   currentFillup.OdoReading,
        Currency:     currentFillup.Currency,
        DistanceUnit: currentFillup.DistanceUnit,
        Mileage:      0,
        CostPerMile:  0,
      }

      if currentFillup.IsTankFull != nil && *currentFillup.IsTankFull && (currentFillup.HasMissedFillup == nil || !(*currentFillup.HasMissedFillup)) {
        currentOdoReading := float32(currentFillup.OdoReading);
        lastFillupOdoReading := float32(lastFillup.OdoReading);
        currentFuelQuantity := float32(currentFillup.FuelQuantity);
        // If miles per gallon option and distanceUnit is km, convert from km to miles 
        // 	then check if fuel unit is litres. If it is, convert to gallons
        if (mileageOption == "mpg" && mileage.DistanceUnit == db.KILOMETERS) {
          currentOdoReading = common.KmToMiles(currentOdoReading);
          lastFillupOdoReading = common.KmToMiles(lastFillupOdoReading);
          if (mileage.FuelUnit == db.LITRE) {
            currentFuelQuantity = common.LitreToGallon(currentFuelQuantity);
          }
        }

        // If km_litre option or litre per 100km and distanceUnit is miles, convert from miles to km 
        // 	then check if fuel unit is not litres. If it isn't, convert to litres

        if ((mileageOption == "km_litre" || mileageOption == "litre_100km") && mileage.DistanceUnit == db.MILES) {
          currentOdoReading = common.MilesToKm(currentOdoReading);
          lastFillupOdoReading = common.MilesToKm(lastFillupOdoReading);

          if (mileage.FuelUnit == db.US_GALLON) {
            currentFuelQuantity = common.GallonToLitre(currentFuelQuantity);
          }
        }




        distance := float32(currentOdoReading - lastFillupOdoReading);
        if (mileageOption == "litre_100km") {
          mileage.Mileage = currentFuelQuantity / distance * 100;
        } else {
          mileage.Mileage = distance / currentFuelQuantity;
        }

        mileage.CostPerMile = distance / currentFillup.TotalAmount;

      }

      mileages = append(mileages, mileage)
    }
  }

	if mileages == nil {
		mileages = make([]models.MileageModel, 0)
	}
	return mileages, nil
}
