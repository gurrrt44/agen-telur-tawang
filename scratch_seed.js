const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const markets = [
        { id: 'mojokerto', base: 22300, high: 23300, low: 22000 },
        { id: 'jombang',   base: 21600, high: 22600, low: 21300 },
        { id: 'kediri',    base: 21400, high: 22400, low: 21100 },
        { id: 'blitar',    base: 21300, high: 22300, low: 21000 },
        { id: 'malang',    base: 22200, high: 23200, low: 21900 },
        { id: 'surabaya',  base: 22300, high: 23300, low: 22000 },
        { id: 'sidoarjo',  base: 22400, high: 23400, low: 22100 },
    ];

    const records = [];
    const today = new Date();

    for (const market of markets) {
        for (let i = 30; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            let price;
            if (i > 15) {
                // ~Apr 24 to May 7
                price = market.high;
            } else if (i > 10) {
                // ~May 8 to May 12
                price = market.high - 200;
            } else if (i > 7) {
                // ~May 13 to May 15
                price = market.low + 400;
            } else if (i > 2) {
                // ~May 16 to May 20
                price = market.low;
            } else {
                // recent days
                price = market.base;
                if (i === 1) price = market.base - 300; // yesterday a bit lower to show trend
            }

            records.push({
                market_id: market.id,
                recorded_date: dateStr,
                price: price
            });
        }
    }

    const { data, error } = await supabase
        .from('price_history')
        .upsert(records, { onConflict: 'market_id,recorded_date' });

    if (error) {
        console.error('Error seeding data:', error);
    } else {
        console.log('Successfully seeded 30 days of historical data for all markets.');
    }
}

seed();
