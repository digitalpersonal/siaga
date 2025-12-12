import type { Service, Plan } from './types';

// Category 1: Consultas Médicas
export const medicalServices: Service[] = [
    { id: 'm1', name: 'Clínico Geral', duration: 20, price: 0, locationType: 'local' },
    { id: 'm2', name: 'Pediatria', duration: 20, price: 0, locationType: 'local' },
    { id: 'm3', name: 'Ginecologia/Obstetrícia', duration: 30, price: 0, locationType: 'local' },
    { id: 'm4', name: 'Saúde da Família', duration: 30, price: 0, locationType: 'local' },
    { id: 'm5', name: 'Cardiologia (Encaminhamento)', duration: 30, price: 0, locationType: 'external' }, // Exemplo de serviço em outra cidade
    { id: 'm6', name: 'Oncologia (Tratamento)', duration: 60, price: 0, locationType: 'external' },
];

// Category 2: Odontologia
export const dentalServices: Service[] = [
    { id: 'd1', name: 'Avaliação Odontológica', duration: 30, price: 0, locationType: 'local' },
    { id: 'd2', name: 'Limpeza e Aplicação de Flúor', duration: 40, price: 0, locationType: 'local' },
    { id: 'd3', name: 'Restauração Simples', duration: 60, price: 0, locationType: 'local' },
    { id: 'd4', name: 'Urgência Odontológica', duration: 40, price: 0, locationType: 'local' },
    { id: 'd5', name: 'Cirurgia Buco-Maxilo', duration: 60, price: 0, locationType: 'external' },
];

// Category 3: Prevenção e Enfermagem
export const nursingServices: Service[] = [
    { id: 'n1', name: 'Vacinação de Rotina', duration: 15, price: 0, locationType: 'local' },
    { id: 'n2', name: 'Vacinação COVID-19 / Influenza', duration: 15, price: 0, locationType: 'local' },
    { id: 'n3', name: 'Curativos e Retirada de Pontos', duration: 30, price: 0, locationType: 'local' },
    { id: 'n4', name: 'Aferição de Pressão/Glicemia', duration: 10, price: 0, locationType: 'local' },
    { id: 'n5', name: 'Coleta de Preventivo', duration: 30, price: 0, locationType: 'local' },
];

// Category 4: Exames e Procedimentos
export const examServices: Service[] = [
    { id: 'e1', name: 'Coleta de Sangue (Laboratório Municipal)', duration: 15, price: 0, locationType: 'local' },
    { id: 'e2', name: 'Raio-X Simples', duration: 20, price: 0, locationType: 'local' },
    { id: 'e3', name: 'Ultrassonografia (Agendada)', duration: 30, price: 0, locationType: 'local' },
    { id: 'e4', name: 'Eletrocardiograma', duration: 20, price: 0, locationType: 'local' },
    { id: 'e5', name: 'Ressonância Magnética (Transporte)', duration: 60, price: 0, locationType: 'external' },
    { id: 'e6', name: 'Tomografia Computadorizada (Transporte)', duration: 45, price: 0, locationType: 'external' },
];

// Health Units in the Municipality
export const HEALTH_UNITS = [
    "UBS Centro (Postão)",
    "PSF Vila Nova",
    "PSF Prata",
    "PSF Santa Bárbara",
    "PSF Bom Jesus",
    "Policlínica Municipal",
    "CAPS - Centro de Atenção Psicossocial",
    "Laboratório Municipal"
];

export const plans: Plan[] = [
  {
    id: 'plan1',
    name: 'Módulo Básico',
    price: 'Licitação',
    features: [
      'Gestão de filas UBS',
      'Até 10 profissionais',
      'Suporte horário comercial',
    ],
    highlight: false,
  },
  {
    id: 'plan2',
    name: 'Módulo Saúde Digital',
    price: 'Licitação',
    features: [
      'Gestão completa SMS',
      'Prontuário Eletrônico',
      'Notificações via WhatsApp',
      'Relatórios de Epidemiologia',
    ],
    highlight: true,
  },
  {
    id: 'plan3',
    name: 'Rede Integrada',
    price: 'Sob Consulta',
    features: [
      'Integração Hospitalar',
      'Múltiplos Municípios',
      'Telemedicina',
      'Suporte 24/7',
    ],
    highlight: false,
  },
];

// Transport Logic
export const VEHICLE_CAPACITIES: { [key: string]: number } = {
    'Carro Oficial': 4,
    'Kombi': 12,
    'Van': 15,
    'Micro-ônibus': 25,
    'Ônibus': 44
};

// Default capacity used for validation if no specific vehicle is assigned yet
export const DEFAULT_TRANSPORT_CAPACITY = 15; // Assuming Van as standard
