package models

type LanguageModel struct {
	Emoji		string `json:"emoji"`
	Name		string `json:"name"`
	NameNative	string `json:"nameNative"`
}

func GetLanguageMastersList() []LanguageModel {
	return []LanguageModel{
		{
			Emoji: "🇬🇧",
			Name: "English",
			NameNative: "English",
		}, {
			Emoji: "🇩🇪",
			Name: "German",
			NameNative: "Deutsch",
		},
	}
}