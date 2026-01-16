import { docClient } from '../src/utils/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Form, FormDefinition } from '../src/models/form';

const FORMS_TABLE = process.env.FORMS_TABLE || 'edgardo-hernandez-api-forms-dev';

const arquetipoFormDefinition: FormDefinition = {
  sections: [
    {
      id: 'section_1',
      title: 'Perfil de Liderazgo',
      questions: [
        {
          id: 'q1',
          type: 'scale',
          label: '¿Con qué frecuencia tomas decisiones importantes en tu negocio?',
          required: true,
          min: 1,
          max: 5,
        },
        {
          id: 'q2',
          type: 'single',
          label: '¿Cuál es tu estilo de comunicación preferido?',
          required: true,
          options: ['Directo y claro', 'Persuasivo y emocional', 'Analítico y detallado', 'Colaborativo y abierto'],
        },
        {
          id: 'q3',
          type: 'multi',
          label: '¿Qué habilidades consideras más importantes para tu éxito?',
          required: true,
          options: ['Liderazgo', 'Creatividad', 'Estrategia', 'Networking', 'Técnicas', 'Comunicación'],
        },
      ],
    },
    {
      id: 'section_2',
      title: 'Visión y Estrategia',
      questions: [
        {
          id: 'q4',
          type: 'scale',
          label: '¿Qué tan importante es para ti tener una visión a largo plazo?',
          required: true,
          min: 1,
          max: 5,
        },
        {
          id: 'q5',
          type: 'textarea',
          label: 'Describe tu visión ideal para tu negocio en 5 años',
          required: false,
        },
        {
          id: 'q6',
          type: 'single',
          label: '¿Cómo manejas los cambios inesperados?',
          required: true,
          options: [
            'Los anticipo y planifico',
            'Me adapto rápidamente',
            'Analizo antes de actuar',
            'Busco apoyo',
          ],
        },
      ],
    },
    {
      id: 'section_3',
      title: 'Creatividad e Innovación',
      questions: [
        {
          id: 'q7',
          type: 'scale',
          label: '¿Con qué frecuencia generas ideas nuevas para tu negocio?',
          required: true,
          min: 1,
          max: 5,
        },
        {
          id: 'q8',
          type: 'text',
          label: 'Menciona una innovación reciente que hayas implementado',
          required: false,
        },
        {
          id: 'q9',
          type: 'multi',
          label: '¿Qué te inspira para innovar?',
          required: true,
          options: [
            'Tendencias del mercado',
            'Necesidades de clientes',
            'Competencia',
            'Tecnología',
            'Experiencias personales',
          ],
        },
      ],
    },
  ],
};

async function seedForms() {
  const form: Form = {
    formId: 'arquetipo_v1',
    title: 'Arquetipo de Liderazgo y Negocio',
    version: '1.0.0',
    definitionJSON: arquetipoFormDefinition,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: FORMS_TABLE,
        Item: form,
      })
    );
    console.log('✅ Seeded form: arquetipo_v1');
  } catch (error) {
    console.error('❌ Error seeding form:', error);
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting seed...');
  console.log('FORMS_TABLE:', FORMS_TABLE);
  
  await seedForms();
  
  console.log('✅ Seed completed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});


