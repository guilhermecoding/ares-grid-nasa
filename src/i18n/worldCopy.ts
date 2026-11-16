import type { Locale } from './locale'

type Translate = (en: string, pt: string) => string

export function nodeCopy(level: number, t: Translate) {
  const nodes: Record<number, { title: string; gate: string; locked: string; soon: string }> = {
    1: {
      title: t('Solar Power', 'Energia Solar'),
      gate: t('Power to explore Mars', 'Energia para explorar Marte'),
      locked: t('Finish the mission before this one!', 'Complete a missão anterior!'),
      soon: t('Coming soon!', 'Em breve!'),
    },
    2: {
      title: t('Health', 'Saúde'),
      gate: t('Caring for the astronaut', 'Cuidando do astronauta'),
      locked: t('Mission locked', 'Missão bloqueada'),
      soon: t('Finish Mission 1 first!', 'Complete a Missão 1 primeiro!'),
    },
    3: {
      title: t('Mars Ice', 'Gelo de Marte'),
      gate: t('The mystery of ice on Mars', 'O mistério do gelo de Marte'),
      locked: t('Not yet!', 'Ainda não!'),
      soon: t('Coming soon!', 'Em breve!'),
    },
    4: {
      title: t('Greenhouse', 'Estufa'),
      gate: t('The first greenhouse on Mars', 'A PRIMEIRA ESTUFA DE MARTE'),
      locked: t('Mission locked', 'Missão bloqueada'),
      soon: t('Coming soon!', 'Em breve!'),
    },
    5: {
      title: t('Storms', 'Tempestades'),
      gate: t('Alert! Storms on Mars', 'ALERTA! TEMPESTADES EM MARTE'),
      locked: t('Last mission — keep going!', 'Última missão — avance mais!'),
      soon: t('Coming soon!', 'Em breve!'),
    },
  }
  return (
    nodes[level] ?? {
      title: t('Mission', 'Missão'),
      gate: t('Mission', 'Missão'),
      locked: t('Mission locked', 'Missão bloqueada'),
      soon: t('Coming soon!', 'Em breve!'),
    }
  )
}

export function badgeCopy(id: number, t: Translate) {
  const badges: Record<number, { title: string; mission: string; photoAlt: string }> = {
    1: {
      title: t('Solar Power', 'Energia Solar'),
      mission: t('Power to explore Mars', 'Energia para explorar Marte'),
      photoAlt: t('Astronaut beside the solar panels in Arcadia Planitia', 'Astronauta ao lado dos painéis solares em Arcadia Planitia'),
    },
    2: {
      title: t('Human Health', 'Saúde Humana'),
      mission: t('Caring for the astronaut', 'Cuidando do astronauta'),
      photoAlt: t('Astronaut running on a treadmill inside the habitat', 'Astronauta correndo na esteira dentro do habitat'),
    },
    3: {
      title: t('Geology and Water', 'Geologia e Água'),
      mission: t('The mystery of ice on Mars', 'O mistério do gelo de Marte'),
      photoAlt: t('Astronaut with an ice sample beside the drill', 'Astronauta com a amostra de gelo ao lado da perfuratriz'),
    },
    4: {
      title: t('Space Farming', 'Agricultura Espacial'),
      mission: t('The first greenhouse on Mars', 'A primeira estufa de Marte'),
      photoAlt: t('Astronaut with the harvest inside the greenhouse', 'Astronauta com a colheita dentro da estufa'),
    },
    5: {
      title: t('Environmental Protection', 'Proteção Ambiental'),
      mission: t('Alert! Storms on Mars', 'Alerta! Tempestades em Marte'),
      photoAlt: t('Astronaut entering the shelter as the dust storm arrives', 'Astronauta entrando no abrigo com a tempestade de poeira chegando'),
    },
  }
  return (
    badges[id] ?? {
      title: t('Mission', 'Missão'),
      mission: t('Mission', 'Missão'),
      photoAlt: t('Science photo', 'Foto científica'),
    }
  )
}

export function indicatorLabel(kind: 'energy' | 'water' | 'wellbeing', t: Translate) {
  if (kind === 'energy') return t('Energy', 'Energia')
  if (kind === 'water') return t('Water', 'Água')
  return t('Health', 'Saúde')
}

export function formatLongDate(epochMs: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(epochMs)
}
