<?php

namespace App\Helpers;

use Nilambar\NepaliDate\NepaliCalendar;

class NepaliDateHelper
{
    private static $calendar;

    private static function getCalendar()
    {
        if (!self::$calendar) {
            if (class_exists('\Nilambar\NepaliDate\NepaliCalendar')) {
                self::$calendar = new \Nilambar\NepaliDate\NepaliCalendar();
            } else {
                return null;
            }
        }
        return self::$calendar;
    }

    /**
     * Get current BS date (Y-m-d)
     */
    public static function now()
    {
        return self::adToBs(date('Y-m-d'));
    }

    /**
     * Convert AD date (Y-m-d) to BS date (Y-m-d)
     */
    public static function adToBs($adDate)
    {
        if (!$adDate) return null;
        
        try {
            $calendar = self::getCalendar();
            if (!$calendar) return $adDate;

            $date = date_parse($adDate);
            if (!$date['year']) return $adDate;

            $bs = $calendar->convertEnglishToNepali($date['year'], $date['month'], $date['day']);
            return sprintf('%04d-%02d-%02d', $bs['year'], $bs['month'], $bs['day']);
        } catch (\Throwable $e) {
            return $adDate;
        }
    }

    /**
     * Convert BS date (Y-m-d) to AD date (Y-m-d)
     */
    public static function bsToAd($bsDate)
    {
        if (!$bsDate) return null;
        
        try {
            $calendar = self::getCalendar();
            if (!$calendar) return $bsDate;

            // Convert Nepali digits to English digits first
            $bsDate = self::convertToEnglishDigits($bsDate);
            
            $parts = explode('-', $bsDate);
            if (count($parts) !== 3) return $bsDate;
            
            $ad = $calendar->convertNepaliToEnglish((int)$parts[0], (int)$parts[1], (int)$parts[2]);
            return sprintf('%04d-%02d-%02d', $ad['year'], $ad['month'], $ad['day']);
        } catch (\Throwable $e) {
            return $bsDate;
        }
    }

    /**
     * Convert English digits to Nepali digits
     */
    public static function convertToNepaliDigits($number)
    {
        $eng = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $nep = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return str_replace($eng, $nep, (string)$number);
    }

    /**
     * Convert Nepali digits to English digits
     */
    public static function convertToEnglishDigits($number)
    {
        $eng = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $nep = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return str_replace($nep, $eng, (string)$number);
    }
}
