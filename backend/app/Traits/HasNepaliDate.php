<?php

namespace App\Traits;

use App\Helpers\NepaliDateHelper;
use App\Helpers\NepaliDate;

trait HasNepaliDate
{
    /**
     * Define which fields should be treated as Nepali dates.
     * This should be defined in the model.
     */
    protected function nepaliDateFields(): array
    {
        return $this->nepaliDates ?? [];
    }

    /**
     * Override the attribute getting logic to convert AD to BS.
     */
    public function getAttribute($key)
    {
        return $this->getNepaliAttribute(parent::getAttribute($key), $key);
    }

    /**
     * Handle the conversion logic.
     */
    protected function getNepaliAttribute($value, $key)
    {
        if (in_array($key, $this->nepaliDateFields()) && $value) {
            $bsDateStr = null;
            // If it's a Carbon instance or a date string, convert to BS
            if ($value instanceof \Carbon\Carbon || $value instanceof \DateTimeInterface) {
                $bsDateStr = NepaliDateHelper::adToBs($value->format('Y-m-d'));
            } else if (is_string($value) && !empty($value)) {
                // Check if it's already a BS date (e.g. 2081-...)
                $parts = explode('-', $value);
                if (count($parts) === 3 && (int)$parts[0] > 2050) {
                    $bsDateStr = $value;
                } else {
                    $bsDateStr = NepaliDateHelper::adToBs($value);
                }
            }
            
            if ($bsDateStr) {
                return new NepaliDate($bsDateStr);
            }
        }

        return $value;
    }

    /**
     * Ensure the BS value is used in arrays.
     */
    public function attributesToArray()
    {
        $attributes = parent::attributesToArray();
        foreach ($this->nepaliDateFields() as $field) {
            if (isset($attributes[$field])) {
                $attributes[$field] = $this->getNepaliAttribute($attributes[$field], $field);
            }
        }
        return $attributes;
    }

    /**
     * Override the attribute setting logic to convert BS to AD.
     */
    public function setAttribute($key, $value)
    {
        if (in_array($key, $this->nepaliDateFields()) && $value) {
            // If it's already a valid AD date (standard YYYY-MM-DD where YYYY < 2050 approx),
            // we might not want to convert it if it's being set from internal logic.
            // But for this app, we'll assume anything set to these fields is BS.
            // BS dates are usually > 2050 (currently 2081).
            if (is_string($value)) {
                $parts = explode('-', $value);
                if (count($parts) === 3 && (int)$parts[0] > 2050) {
                    $value = NepaliDateHelper::bsToAd($value);
                }
            }
        }

        return parent::setAttribute($key, $value);
    }
}
