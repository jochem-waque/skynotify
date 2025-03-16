package config

import (
	"errors"
	"fmt"
	"os"

	"github.com/lpernett/godotenv"
)

func LoadEnv() error {
	if _, err := os.Stat(".env"); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}

		return fmt.Errorf("LoadEnv: %w", err)
	}

	if err := godotenv.Load(); err != nil {
		return fmt.Errorf("LoadEnv: %w", err)
	}

	return nil
}
