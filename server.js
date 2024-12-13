const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

// تمكين CORS back and front
app.use(cors());

// Middleware للتحقق من استجابة API
async function checkPokemonExistence(req, res, next) {// async and await for organiser the code   en ingore repitation  of then
    const query = req.query.q; // اسم أو معرف البوكيمون من الطلب

    if (!query) {
        return res.status(400).json({ error: "يرجى توفير اسم أو معرف البوكيمون." });
    }

    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`; 

    try {
        // محاولة جلب البيانات من PokeAPI
        const response = await axios.get(apiUrl); // remplace await

        if (response.status === 200) {
            // إذا كانت الاستجابة صحيحة، نمرر البيانات إلى الخطوة التالية في الـ middleware
            req.pokemonData = response.data; // تخزين البيانات في الكائن req
            return next(); // الانتقال إلى الخطوة التالية (المعالجة الفعلية)
        } else {
            // إذا كانت حالة الاستجابة غير 200، نعرض رسالة خطأ
            return res.status(404).json({ error: "البوكيمون غير موجود." });
        }
    } catch (error) {
        // إذا حدث خطأ في الاتصال بـ PokeAPI
        return res.status(500).json({ error: "حدث خطأ أثناء الاتصال بـ PokeAPI." });
    }
}

// مسار البحث عن بوكيمون باستخدام middleware
app.get("/api/pokemon", checkPokemonExistence, (req, res) => {
    // نستخدم البيانات التي جلبناها من PokeAPI
    const data = req.pokemonData;

    // تجهيز البيانات للإرسال إلى الواجهة الأمامية
    const result = {
        id: data.id,
        name: data.name,
        type: data.types.map(t => t.type.name),
        abilities: data.abilities.map(a => a.ability.name),
        base_experience: data.base_experience,
        height: data.height,
        weight: data.weight,
        sprite: data.sprites.front_default,
    };

    // إرسال البيانات إلى العميل--
    res.json(result);
});

// بدء تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
