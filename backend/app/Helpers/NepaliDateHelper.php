<?php

namespace App\Helpers;

use Nilambar\NepaliDate\NepaliCalendar;

class NepaliDateHelper
{
    private static $calendar;

    private static function getCalendar()
    {
        if (!self::$calendar) {
            self::$calendar = new NepaliCalendar();
        }
        return self::$calendar;
    }

    /**
     * Convert AD date (Y-m-d) to BS date (Y-m-d)
     */
    public static function adToBs($adDate)
    {
        if (!$adDate) return null;
        
        try {
            $date = date_parse($adDate);
            $bs = self::getCalendar()->convertEnglishToNepali($date['year'], $date['month'], $date['day']);
            return sprintf('%04d-%02d-%02d', $bs['year'], $bs['month'], $bs['day']);
        } catch (\Exception $e) {
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
            // Convert Nepali digits to English digits first
            $bsDate = self::convertToEnglishDigits($bsDate);
            
            $parts = explode('-', $bsDate);
            if (count($parts) !== 3) return $bsDate;
            
            $ad = self::getCalendar()->convertNepaliToEnglish((int)$parts[0], (int)$parts[1], (int)$parts[2]);
            return sprintf('%04d-%02d-%02d', $ad['year'], $ad['month'], $ad['day']);
        } catch (\Exception $e) {
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
