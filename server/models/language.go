package models

type LanguageModel struct {
	Emoji		string `json:"emoji"`
	Name		string `json:"name"`
	NameNative	string `json:"nameNative"`
	Shorthand	string `json:"shorthand"`
}

func GetLanguageMastersList() []LanguageModel {
	return []LanguageModel{
		{
			Emoji: "🇬🇧",
			Name: "English",
			NameNative: "English",
			Shorthand: "en",
		}, {
			Emoji: "🇩🇪",
			Name: "German",
			NameNative: "Deutsch",
			Shorthand: "de",
		},
	}
}