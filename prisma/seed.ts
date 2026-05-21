import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ─────────────────────────────────────────
  // GameModes — IDs fixes
  // ─────────────────────────────────────────
  await prisma.gameMode.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      key: 'DUEL',
      name: 'Duel',
      description: 'Affrontement entre deux équipes avec calcul ELO',
      icon: '⚔️',
      teamNames: ['Équipe 1', 'Équipe 2'],
      hasElo: true,
      hasTeams: true,
    },
    update: {},
  });

  await prisma.gameMode.upsert({
    where: { id: 2 },
    create: {
      id: 2,
      key: 'VAMPIRE',
      name: 'Vampire',
      description: 'Les vampires doivent contaminer tous les villageois',
      icon: '🧛',
      teamNames: ['Vampires', 'Villageois'],
      hasElo: false,
      hasTeams: true,
    },
    update: {},
  });

  await prisma.gameMode.upsert({
    where: { id: 3 },
    create: {
      id: 3,
      key: 'HUNGER_GAMES',
      name: 'Hunger Games',
      description: 'Dernier survivant remporte la victoire',
      icon: '🏹',
      teamNames: [],
      hasElo: false,
      hasTeams: false,
    },
    update: {},
  });

  // ─────────────────────────────────────────
  // Achievements
  // ─────────────────────────────────────────

  const achievements = [
    // Grades
    {
      key: 'GRADE_BRONZE',
      name: 'Grade Bronze',
      description: 'Atteindre le grade Bronze',
      icon: '🥉',
      category: 'GRADE',
      threshold: 1200,
      isAuto: true,
    },
    {
      key: 'GRADE_ARGENT',
      name: 'Grade Argent',
      description: 'Atteindre le grade Argent',
      icon: '🥈',
      category: 'GRADE',
      threshold: 1350,
      isAuto: true,
    },
    {
      key: 'GRADE_OR',
      name: 'Grade Or',
      description: 'Atteindre le grade Or',
      icon: '🥇',
      category: 'GRADE',
      threshold: 1500,
      isAuto: true,
    },
    {
      key: 'GRADE_DIAMANT',
      name: 'Grade Diamant',
      description: 'Atteindre le grade Diamant',
      icon: '💎',
      category: 'GRADE',
      threshold: 1650,
      isAuto: true,
    },
    {
      key: 'GRADE_PLATINE',
      name: 'Grade Platine',
      description: 'Atteindre le grade Platine',
      icon: '🔷',
      category: 'GRADE',
      threshold: 1750,
      isAuto: true,
    },
    {
      key: 'GRADE_ELITE',
      name: 'Grade Elite',
      description: 'Atteindre le grade Elite',
      icon: '⭐',
      category: 'GRADE',
      threshold: 1850,
      isAuto: true,
    },
    {
      key: 'GRADE_CHAMPION',
      name: 'Grade Champion',
      description: 'Atteindre le grade Champion',
      icon: '🏆',
      category: 'GRADE',
      threshold: 1950,
      isAuto: true,
    },
    {
      key: 'GRADE_LEGENDE',
      name: 'Grade Légende',
      description: 'Atteindre le grade Légende',
      icon: '👑',
      category: 'GRADE',
      threshold: 2100,
      isAuto: true,
    },

    // Duel — Victoires
    {
      key: 'DUEL_WIN_3',
      name: 'Victorieux',
      description: '3 victoires en duel',
      icon: '⚔️',
      category: 'DUEL',
      threshold: 3,
      isAuto: true,
    },
    {
      key: 'DUEL_WIN_10',
      name: 'Batailleur Glorieux',
      description: '10 victoires en duel',
      icon: '⚔️',
      category: 'DUEL',
      threshold: 10,
      isAuto: true,
    },
    {
      key: 'DUEL_WIN_30',
      name: "Sniper d'élite",
      description: '30 victoires en duel',
      icon: '🎯',
      category: 'DUEL',
      threshold: 30,
      isAuto: true,
    },
    {
      key: 'DUEL_WIN_100',
      name: 'Dévastateur Magistral',
      description: '100 victoires en duel',
      icon: '💥',
      category: 'DUEL',
      threshold: 100,
      isAuto: true,
    },

    // Duel — Parties jouées
    {
      key: 'DUEL_PLAYED_10',
      name: 'Duelliste',
      description: '10 parties en duel',
      icon: '⚔️',
      category: 'DUEL',
      threshold: 10,
      isAuto: true,
    },
    {
      key: 'DUEL_PLAYED_30',
      name: 'Duelliste Vétéran',
      description: '30 parties en duel',
      icon: '⚔️',
      category: 'DUEL',
      threshold: 30,
      isAuto: true,
    },
    {
      key: 'DUEL_PLAYED_100',
      name: 'Expert en duel',
      description: '100 parties en duel',
      icon: '🏅',
      category: 'DUEL',
      threshold: 100,
      isAuto: true,
    },

    // Duel — Spéciaux
    {
      key: 'OEIL_POUR_OEIL',
      name: 'Œil pour Œil',
      description:
        'Remporter un duel en étant le dernier survivant de son équipe',
      icon: '👁️',
      category: 'DUEL',
      threshold: null,
      isAuto: false,
    },
    {
      key: 'PARRAIN',
      name: 'Parrain',
      description: 'Avoir ramené 5 joueurs au Game Center',
      icon: '🤝',
      category: 'SPECIAL',
      threshold: 5,
      isAuto: false,
    },

    // Vampire
    {
      key: 'VAMPIRE_3',
      name: 'Vampire',
      description: '3 victoires en tant que Vampire',
      icon: '🧛',
      category: 'VAMPIRE',
      threshold: 3,
      isAuto: true,
    },
    {
      key: 'VAMPIRE_10',
      name: 'Maître Vampire',
      description: '10 victoires en tant que Vampire',
      icon: '🧛',
      category: 'VAMPIRE',
      threshold: 10,
      isAuto: true,
    },
    {
      key: 'VAMPIRE_30',
      name: 'Crocs des enfers',
      description: '30 victoires en tant que Vampire',
      icon: '🩸',
      category: 'VAMPIRE',
      threshold: 30,
      isAuto: true,
    },
    {
      key: 'SURVIVOR_3',
      name: 'Survivant',
      description: '3 victoires en tant que Survivant',
      icon: '🛡️',
      category: 'VAMPIRE',
      threshold: 3,
      isAuto: true,
    },
    {
      key: 'SURVIVOR_10',
      name: 'Chasseur de Vampires',
      description: '10 victoires en tant que Survivant',
      icon: '🔫',
      category: 'VAMPIRE',
      threshold: 10,
      isAuto: true,
    },
    {
      key: 'SURVIVOR_30',
      name: "Gardien de l'humanité",
      description: '30 victoires en tant que Survivant',
      icon: '✝️',
      category: 'VAMPIRE',
      threshold: 30,
      isAuto: true,
    },
    {
      key: 'SANG_POUR_SANG',
      name: 'Sang pour Sang',
      description: 'Dernier survivant dans le mode Vampire',
      icon: '🩸',
      category: 'VAMPIRE',
      threshold: null,
      isAuto: false,
    },

    // HungerGames
    {
      key: 'HG_WIN_1',
      name: 'Conquérant',
      description: '1 victoire en HungerGames',
      icon: '🏹',
      category: 'HUNGER_GAMES',
      threshold: 1,
      isAuto: true,
    },
    {
      key: 'HG_WIN_3',
      name: 'Champion des Hunger Games',
      description: '3 victoires en HungerGames',
      icon: '🏹',
      category: 'HUNGER_GAMES',
      threshold: 3,
      isAuto: true,
    },
    {
      key: 'HG_WIN_10',
      name: 'Champion ultime des Hunger Games',
      description: '10 victoires en HungerGames',
      icon: '👑',
      category: 'HUNGER_GAMES',
      threshold: 10,
      isAuto: true,
    },
    {
      key: 'DENT_POUR_DENT',
      name: 'Dent pour Dent',
      description: 'Dernier survivant en HungerGames',
      icon: '⚡',
      category: 'HUNGER_GAMES',
      threshold: null,
      isAuto: false,
    },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      create: a as any,
      update: {},
    });
  }

  console.log('✅ Seed terminé !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
