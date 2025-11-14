const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function insertSampleReviews() {
  console.log("📝 Inserting sample reviews...\n");

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("city", "Austin")
    .limit(3);

  for (const restaurant of restaurants) {
    const reviews = [
      {
        restaurant_id: restaurant.id,
        rating: 5,
        review: "Absolutely amazing food! The flavors were incredible and the service was top-notch.",
        review_text: "Absolutely amazing food! The flavors were incredible and the service was top-notch.",
        author_name: "Sarah M.",
        source: "GOOGLE",
        created_at: new Date().toISOString(),
      },
      {
        restaurant_id: restaurant.id,
        rating: 4,
        review: "Great atmosphere and delicious dishes. Would definitely recommend!",
        review_text: "Great atmosphere and delicious dishes. Would definitely recommend!",
        author_name: "John D.",
        source: "GOOGLE",
        created_at: new Date().toISOString(),
      },
      {
        restaurant_id: restaurant.id,
        rating: 5,
        review: "One of the best meals I've had in Austin. The attention to detail is impressive.",
        review_text: "One of the best meals I've had in Austin. The attention to detail is impressive.",
        author_name: "Emily R.",
        source: "GOOGLE",
        created_at: new Date().toISOString(),
      },
    ];

    const { error } = await supabase.from("reviews").insert(reviews);
    if (error) {
      console.log(`   ❌ Error for ${restaurant.name}:`, error.message);
    } else {
      console.log(`   ✅ Added 3 reviews for ${restaurant.name}`);
    }
  }

  console.log("\n✅ Sample reviews inserted!");
}

insertSampleReviews();
