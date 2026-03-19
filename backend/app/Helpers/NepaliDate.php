<?php

namespace App\Helpers;

use JsonSerializable;

class NepaliDate implements JsonSerializable
{
    protected $bsDate;

    public function __construct($bsDate)
    {
        $this->bsDate = $bsDate;
    }

    public function jsonSerialize(): mixed
    {
        return $this->bsDate;
    }

    public function format($format = 'Y-m-d')
    {
        // Simple implementation of format
        // For now, let's just return the BS date as-is if format is Y-m-d
        if ($format === 'Y-m-d') {
            return $this->bsDate;
        }
        
        // Handle M d, Y format commonly used in the app
        if ($format === 'M d, Y') {
            $parts = explode('-', $this->bsDate);
            if (count($parts) === 3) {
                $months = [
                    1 => 'Baisakh', 2 => 'Jestha', 3 => 'Asar', 4 => 'Shrawan',
                    5 => 'Bhadra', 6 => 'Ashwin', 7 => 'Kartik', 8 => 'Mangsir',
                    9 => 'Poush', 10 => 'Magh', 11 => 'Falgun', 12 => 'Chaitra'
                ];
                $m = (int)$parts[1];
                return ($months[$m] ?? $parts[1]) . ' ' . $parts[2] . ', ' . $parts[0];
            }
        }

        return $this->bsDate;
    }

    public function __toString()
    {
        return $this->bsDate;
    }

    /**
     * For diffForHumans and other Carbon methods, we might need more.
     * But let's start with this.
     */
}
