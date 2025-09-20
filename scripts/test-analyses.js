/**
 * Test pour vérifier que les analyses utilisent tous les tirages
 */

const fs = require('fs');
const path = require('path');

// Lire la base de données
const tiragesPath = path.join(process.cwd(), 'data', 'tirages.json');
const tirages = JSON.parse(fs.readFileSync(tiragesPath, 'utf8'));

console.log(`📊 Total tirages en base: ${tirages.length}`);

// Vérifier le format des tirages
const oldFormat = tirages.filter(t => t.boule_1 != null);
const newFormat = tirages.filter(t => t.numero1 != null);

console.log(`🔵 Format FDJ (boule_1): ${oldFormat.length}`);
console.log(`🔴 Format OpenDataSoft (numero1): ${newFormat.length}`);

// Vérifier les derniers tirages
console.log(`\n📅 Les 5 derniers tirages:`);
const recent = tirages.slice(0, 5);
recent.forEach(t => {
  if (t.boule_1) {
    console.log(`${t.date}: [${t.boule_1},${t.boule_2},${t.boule_3},${t.boule_4},${t.boule_5}] + ${t.numero_chance} (FDJ)`);
  } else {
    console.log(`${t.date}: [${t.numero1},${t.numero2},${t.numero3},${t.numero4},${t.numero5}] + ${t.complementaire} (OpenDataSoft)`);
  }
});

console.log(`\n✅ Conclusion: ${oldFormat.length === tirages.length ? 'Format unifié FDJ' : 'Format mixte détecté!'}`);
