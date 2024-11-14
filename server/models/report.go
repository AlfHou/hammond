package models

import (
	"encoding/json"
	"time"

	"hammond/db"
)

type MileageModel struct {
	Date           time.Time   `form:"date" json:"date" binding:"required" time_format:"2006-01-02"`
	StartDate      time.Time   `form:"startDate" json:"startDate" binding:"required" time_format:"2006-01-02"`
	EndDate        time.Time   `form:"endDate" json:"endDate" binding:"required" time_format:"2006-01-02"`
	VehicleID      string      `form:"vehicleId" json:"vehicleId" binding:"required"`
	FuelUnit       db.FuelUnit `form:"fuelUnit" json:"fuelUnit" binding:"required"`
	FuelQuantity   float32     `form:"fuelQuantity" json:"fuelQuantity" binding:"required"`
	PerUnitPrice   float32     `form:"perUnitPrice" json:"perUnitPrice" binding:"required"`
	Currency       string      `json:"currency"`
	DistanceUnit   db.DistanceUnit `form:"distanceUnit" json:"distanceUnit"`
	Mileage        float32     `form:"mileage" json:"mileage" binding:"mileage"`
	CostPerMile    float32     `form:"costPerMile" json:"costPerMile" binding:"costPerMile"`
	OdoReading     int         `form:"odoReading" json:"odoReading" binding:"odoReading"`
	DistanceTravel float32     `form:"distanceTravel" json:"distanceTravel" binding:"distanceTravel"`
}

func (v *MileageModel) FuelUnitDetail() db.EnumDetail {
	return db.FuelUnitDetails[v.FuelUnit]
}
func (b *MileageModel) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		MileageModel
		FuelUnitDetail db.EnumDetail `json:"fuelUnitDetail"`
	}{
		MileageModel:   *b,
		FuelUnitDetail: b.FuelUnitDetail(),
	})
}

type MileageQueryModel struct {
	Since time.Time `json:"since" query:"since" form:"since"`
	MileageOption string `json:"mileageOption" query:"mileageOption" form:"mileageOption"`
}
