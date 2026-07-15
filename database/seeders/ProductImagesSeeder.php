<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductImagesSeeder extends Seeder
{
    public function run()
    {
        $imageMapping = [
            'oil filter' => '/images/oil filter.jpg',
            'air filter' => '/images/Air Filter.jpg',
            'spark plug' => '/images/Spar plus.jpg',
            'fuel filter' => '/images/Fuel Filter.jpg',
            'pcv valve' => '/images/PCV Valve.jpg',
            'timing belt' => '/images/Serpentine Belt.jpg',
            'serpentine belt' => '/images/Serpentine Belt.jpg',
            'water pump' => '/images/Coolant Radiator Fluid.jpg',
            'thermostat' => '/images/Coolant Radiator Fluid.jpg',
            'brake pad' => '/images/Brake pads.jpg',
            'brake rotor' => '/images/Brake Rotor (Disc).jpg',
            'brake caliper' => '/images/Brake Caliper (Front).jpg',
            'brake drum' => '/images/Brake Drum.jpg',
            'brake hose' => '/images/Brake Hose Assembly.jpg',
            'master cylinder' => '/images/Brake Master Cylinder.jpg',
            'abs sensor' => '/images/ABS Sensor.jpg',
            'brake fluid' => '/images/Brake Fluid.jpg',
            'shock absorber' => '/images/Shock Absorber.jpg',
            'strut' => '/images/Strut Assembly.jpg',
            'control arm' => '/images/Control Arm.jpg',
            'ball joint' => '/images/Ball Joint.jpg',
            'tie rod' => '/images/Tie Rod End.jpg',
            'sway bar' => '/images/Sway Bar Link.jpg',
            'coil spring' => '/images/Coil Spring.jpg',
            'leaf spring' => '/images/Leaf Spring.jpg',
            'alternator' => '/images/Alternator.jpg',
            'starter motor' => '/images/Starter Motor.jpg',
            'battery' => '/images/Car Battery.jpg',
            'headlight' => '/images/LED Headlight Bulbs.jpg',
            'tail light' => '/images/Tail Light Bulb.jpg',
            'wiper' => '/images/Wiper Blade Assembly.jpg',
            'ignition coil' => '/images/Voltage Regulator.jpg',
            'oxygen sensor' => '/images/ECU Control Module.jpg',
            'floor mat' => '/images/Floor Mats.jpg',
            'seat cover' => '/images/Car Seat Cover.jpg',
            'steering cover' => '/images/Steering Wheel Cover.jpg',
            'spoiler' => '/images/Car Rear Spoiler.jpg',
            'roof rack' => '/images/Roof Rack.jpg',
            'dome light' => '/images/LED Interior Dome Light.jpg',
            'mud flap' => '/images/Mud Flaps.jpg',
            'air freshener' => '/images/Car Air Freshener.jpg',
            'bumper' => '/images/Bumper Protector.jpg',
            'cabin air filter' => '/images/Cabin Air Filter.jpg',
            'ceramic brake' => '/images/Ceramic Brake Pads (Front).jpg',
            'ecu' => '/images/ECU Control Module.jpg',
            'engine oil' => '/images/Engine Oil (Synthetic).jpg',
            'fuse box' => '/images/Fuse Box.jpg',
            'stabilizer bar' => '/images/Stabilizer Bar.jpg',
            'suspension spring' => '/images/Suspension Spring.jpg',
            'transmission fluid' => '/images/Transmission Fluid.jpg',
            'voltage regulator' => '/images/Voltage Regulator.jpg',
        ];

        $products = Product::all();
        $updated = 0;

        foreach ($products as $product) {
            $productName = strtolower($product->name);
            $imagePath = null;

            foreach ($imageMapping as $keyword => $path) {
                if (strpos($productName, $keyword) !== false) {
                    $imagePath = $path;
                    break;
                }
            }

            if ($imagePath && (!$product->images || $product->images === '[]' || $product->images === '')) {
                $product->images = json_encode([$imagePath]);
                $product->save();
                $updated++;
            }
        }

        $this->command->info("Updated {$updated} products with images.");
    }
}
