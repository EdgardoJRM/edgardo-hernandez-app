import { docClient } from '../utils/dynamodb';
import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export interface FormQuestion {
  id: string;
  type: 'text' | 'textarea' | 'single' | 'multi' | 'scale';
  label: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

export interface FormSection {
  id: string;
  title: string;
  questions: FormQuestion[];
}

export interface FormDefinition {
  sections: FormSection[];
}

export interface Form {
  formId: string;
  title: string;
  version: string;
  definitionJSON: FormDefinition;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

const FORMS_TABLE = process.env.FORMS_TABLE!;

export async function getFormById(formId: string): Promise<Form | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: FORMS_TABLE,
      Key: { formId },
    })
  );
  return result.Item as Form | null;
}

export async function getAllForms(): Promise<Form[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: FORMS_TABLE,
      FilterExpression: 'isActive = :active',
      ExpressionAttributeValues: {
        ':active': true,
      },
    })
  );
  return (result.Items || []) as Form[];
}


