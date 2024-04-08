package service

import (
	"errors"
	"hammond/db"
	"hammond/models"
)

func CanInitializeSystem() (bool, error) {
	return db.CanInitializeSystem()
}

func UpdateSettings(currency string, distanceUnit db.DistanceUnit) error {
	setting := db.GetOrCreateSetting()
	setting.Currency = currency
	setting.DistanceUnit = distanceUnit
	return db.UpdateSettings(setting)
}
func UpdateUserSettings(userId, currency string, distanceUnit db.DistanceUnit, dateFormat string, language string) error {
	user, err := db.GetUserById(userId)
	if err != nil {
		return err
	}

	// TODO: Pull into function
	languageExists := false
	languages := models.GetLanguageMastersList();
	for _, lang := range languages {
		if (language == lang.Shorthand){
			languageExists = true
		}
	}

	if (!languageExists) {
		return errors.New("Language not in masters list")
	}


	user.Currency = currency
	user.DistanceUnit = distanceUnit
	user.DateFormat = dateFormat
	user.Language = language
	return db.UpdateUser(user)
}

func GetSettings() *db.Setting {
	return db.GetOrCreateSetting()
}
