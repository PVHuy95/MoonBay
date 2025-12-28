<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\ServicePricing;

class ServicesTableSeeder extends Seeder
{
    public function run()
    {
        $services = [
            [
                'title' => 'Moonbay Spa',
                'image' => './images/Long/Services/MoonbaySpa.jpg',
                'description' => 'Experience ultimate relaxation at Moonbay Spa with premium health and beauty treatments to help you recharge and restore your balance.',
                'detailed_description' => 'Moonbay Spa offers a holistic therapy experience with essential oil massages, hot stone massages, advanced facial care, body scrubs, and body wrap treatments. Our professional therapists, tranquil space, gentle scents, and relaxing music ensure you enjoy every moment.',
                'working_hours' => 'Open daily: 9:00 AM - 10:00 PM',
                'pricing' => [
                    ['type' => '60-minute full body massage', 'value' => '$32'],
                    ['type' => '90-minute hot stone massage', 'value' => '$48'],
                    ['type' => 'Facial care', 'value' => '$36 - $60'],
                    ['type' => 'Body scrub', 'value' => '$38'],
                ]
            ],
            [
                'title' => 'Infinity Pool',
                'image' => './images/Long/Services/Swimming Pool.jpg',
                'description' => 'Immerse yourself in the cool blue water of our rooftop infinity pool, enjoy panoramic city views, and breathe in the fresh air.',
                'detailed_description' => 'The Moonbay pool features a modern design with a smart filtration system and stable year-round temperature. Relax on sun loungers, enjoy drinks and snacks at the pool bar, and take advantage of complimentary towels for hotel guests.',
                'working_hours' => 'Open: 6:00 AM - 9:00 PM daily',
                'pricing' => [
                    ['type' => 'Hotel guests', 'value' => 'Complimentary'],
                    ['type' => 'Day visitors', 'value' => '$12/person/visit']
                ]
            ],
            [
                'title' => 'Moonbay Gym',
                'image' => './images/Long/Services/Moonbay Gym.jpg',
                'description' => 'Stay fit in our modern gym with high-end equipment, spacious and airy environment, and professional trainers.',
                'detailed_description' => 'Moonbay Gym is fully equipped with treadmills, bikes, multi-function machines, free weights, and a yoga area. We also offer group classes such as yoga, HIIT, pilates, spinning, and personal trainer services on request.',
                'working_hours' => 'Mon-Fri: 5:00 AM - 10:00 PM | Sat-Sun: 6:00 AM - 9:00 PM',
                'pricing' => [
                    ['type' => 'Hotel guests', 'value' => 'Complimentary'],
                    ['type' => 'Monthly membership', 'value' => '$30'],
                    ['type' => 'Personal trainer', 'value' => '$20/hour']
                ] 
            ],
            [
                'title' => 'Moonbay Buffet',
                'image' => './images/Long/Services/Moonbay Buffet.jpg',
                'description' => 'Enjoy over 60 signature dishes from Asia to Europe at Moonbay Buffet, in a luxurious space with professional service.',
                'detailed_description' => 'Moonbay Buffet serves a diverse menu: fresh seafood, BBQ grill, Asian and Western cuisine, dessert and fruit counters. Our experienced chefs use only the freshest ingredients, with seasonal menu changes to suit every taste.',
                'working_hours' => 'Breakfast: 6:30 - 10:30 AM | Lunch: 12:00 - 2:30 PM | Dinner: 6:00 - 10:00 PM',
                'pricing' => [
                    ['type' => 'Breakfast buffet', 'value' => '$14/person'],
                    ['type' => 'Lunch buffet', 'value' => '$18/person'],
                    ['type' => 'Dinner buffet', 'value' => '$24/person'],
                    ['type' => 'Weekend brunch', 'value' => '$22/person']
                ]
            ],
            [
                'title' => 'Airport Shuttle & City Tour',
                'image' => './images/Long/Services/Shuttle and Transportation.jpg',
                'description' => 'Travel safely and conveniently with our airport shuttle, daily city shuttle, and private car rental services.',
                'detailed_description' => 'Moonbay provides 24/7 airport transfers, free daily shuttles to the city center, private car rental by the hour, professional drivers, and dedicated customer support. Book in advance for the best service.',
                'working_hours' => 'City shuttle: 8:00 AM - 5:00 PM | Airport transfer: 24/7 (reservation required)',
                'pricing' => [
                    ['type' => 'Airport transfer', 'value' => '$12/way'],
                    ['type' => 'City shuttle', 'value' => 'Complimentary (reservation required)'],
                    ['type' => 'Private car (4 hours)', 'value' => '$48']
                ],
                
            ]

            // ...Thêm các dịch vụ khác tương tự...
        ];

        foreach ($services as $serviceData) {
            $pricing = $serviceData['pricing'];
            unset($serviceData['pricing']);
            $service = \App\Models\Service::create($serviceData);
            foreach ($pricing as $price) {
                \App\Models\ServicePricing::create([
                    'service_id' => $service->id,
                    'type' => $price['type'],
                    'value' => $price['value'],
                ]);
            }
        }
    }
}
