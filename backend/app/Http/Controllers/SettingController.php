<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = $request->all();

        foreach ($settings as $key => $value) {
            // Handle base64 images (Logo, Stamp, Signature)
            if (is_string($value) && str_starts_with($value, 'data:image/')) {
                $value = $this->saveBase64Image($key, $value);
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    private function saveBase64Image($key, $base64String)
    {
        try {
            // Extract the extension and the data
            if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
                $data = substr($base64String, strpos($base64String, ',') + 1);
                $type = strtolower($type[1]); // png, jpg, etc.

                if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                    throw new \Exception('invalid image type');
                }

                $data = base64_decode($data);

                if ($data === false) {
                    throw new \Exception('base64_decode failed');
                }
            } else {
                throw new \Exception('did not match data URI with image data');
            }

            $fileName = $key . '_' . time() . '.' . $type;
            $path = 'branding/' . $fileName;
            
            // Ensure directory exists
            if (!Storage::disk('public')->exists('branding')) {
                Storage::disk('public')->makeDirectory('branding');
            }

            Storage::disk('public')->put($path, $data);

            // Return the full URL for the frontend to use
            return asset('storage/' . $path);
        } catch (\Exception $e) {
            Log::error('Error saving base64 image: ' . $e->getMessage());
            return $base64String; // Fallback to storing base64 if saving fails
        }
    }
}
