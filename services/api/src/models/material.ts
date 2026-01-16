import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Material {
  materialId: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unit?: string; // unidades, kg, litros, etc.
  location?: string;
  supplier?: string;
  cost?: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'reserved';
  createdBy: string; // userId
  createdAt: number;
  updatedAt: number;
}

const MATERIALS_TABLE = process.env.MATERIALS_TABLE!;

export async function getMaterialById(materialId: string): Promise<Material | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: MATERIALS_TABLE,
      Key: { materialId },
    })
  );
  return result.Item as Material | null;
}

export async function getAllMaterials(): Promise<Material[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: MATERIALS_TABLE,
    })
  );
  return (result.Items || []) as Material[];
}

export async function getMaterialsByCategory(category: string): Promise<Material[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: MATERIALS_TABLE,
      IndexName: 'category-index',
      KeyConditionExpression: '#category = :category',
      ExpressionAttributeNames: {
        '#category': 'category',
      },
      ExpressionAttributeValues: {
        ':category': category,
      },
    })
  );
  return (result.Items || []) as Material[];
}

export async function createMaterial(material: Omit<Material, 'materialId' | 'createdAt' | 'updatedAt'>): Promise<Material> {
  const now = Date.now();
  const newMaterial: Material = {
    ...material,
    materialId: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: MATERIALS_TABLE,
      Item: newMaterial,
    })
  );
  return newMaterial;
}

export async function updateMaterial(materialId: string, updates: Partial<Omit<Material, 'materialId' | 'createdAt'>>): Promise<Material> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  if (updates.name !== undefined) {
    updateExpressions.push('#name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = updates.name;
  }
  if (updates.description !== undefined) {
    updateExpressions.push('description = :description');
    expressionAttributeValues[':description'] = updates.description;
  }
  if (updates.category !== undefined) {
    updateExpressions.push('#category = :category');
    expressionAttributeNames['#category'] = 'category';
    expressionAttributeValues[':category'] = updates.category;
  }
  if (updates.quantity !== undefined) {
    updateExpressions.push('quantity = :quantity');
    expressionAttributeValues[':quantity'] = updates.quantity;
  }
  if (updates.unit !== undefined) {
    updateExpressions.push('#unit = :unit');
    expressionAttributeNames['#unit'] = 'unit';
    expressionAttributeValues[':unit'] = updates.unit;
  }
  if (updates.location !== undefined) {
    updateExpressions.push('location = :location');
    expressionAttributeValues[':location'] = updates.location;
  }
  if (updates.supplier !== undefined) {
    updateExpressions.push('supplier = :supplier');
    expressionAttributeValues[':supplier'] = updates.supplier;
  }
  if (updates.cost !== undefined) {
    updateExpressions.push('cost = :cost');
    expressionAttributeValues[':cost'] = updates.cost;
  }
  if (updates.status !== undefined) {
    updateExpressions.push('#status = :status');
    expressionAttributeNames['#status'] = 'status';
    expressionAttributeValues[':status'] = updates.status;
  }

  updateExpressions.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = Date.now();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: MATERIALS_TABLE,
      Key: { materialId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as Material;
}

export async function deleteMaterial(materialId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: MATERIALS_TABLE,
      Key: { materialId },
    })
  );
}

