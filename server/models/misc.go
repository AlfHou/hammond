package models

import "hammond/db"

type UpdateSettingModel struct {
	Currency     string           `json:"currency" form:"currency" query:"currency"`
	DateFormat   string           `json:"dateFormat" form:"dateFormat" query:"dateFormat"`
	DistanceUnit *db.DistanceUnit `json:"distanceUnit" form:"distanceUnit" query:"distanceUnit" `
	Language     string           `json:"language" form:"language" query:"language"`
}

type ClarksonMigrationModel struct {
	Url string `json:"url" form:"url" query:"url"`
}
