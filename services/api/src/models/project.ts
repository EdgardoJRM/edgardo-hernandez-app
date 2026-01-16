import { docClient } from '../utils/dynamodb';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
  projectId: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[]; // userIds
  startDate?: number;
  dueDate?: number;
  completedDate?: number;
  budget?: number;
  actualCost?: number;
  tags?: string[];
  createdBy: string; // userId
  createdAt: number;
  updatedAt: number;
}

const PROJECTS_TABLE = process.env.PROJECTS_TABLE!;

export async function getProjectById(projectId: string): Promise<Project | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId },
    })
  );
  return result.Item as Project | null;
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: PROJECTS_TABLE,
      IndexName: 'assignedTo-index',
      KeyConditionExpression: 'assignedTo = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  );
  return (result.Items || []) as Project[];
}

export async function getAllProjects(): Promise<Project[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: PROJECTS_TABLE,
    })
  );
  return (result.Items || []) as Project[];
}

export async function createProject(project: Omit<Project, 'projectId' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const now = Date.now();
  const newProject: Project = {
    ...project,
    projectId: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: PROJECTS_TABLE,
      Item: newProject,
    })
  );
  return newProject;
}

export async function updateProject(projectId: string, updates: Partial<Omit<Project, 'projectId' | 'createdAt'>>): Promise<Project> {
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
  if (updates.status !== undefined) {
    updateExpressions.push('#status = :status');
    expressionAttributeNames['#status'] = 'status';
    expressionAttributeValues[':status'] = updates.status;
  }
  if (updates.priority !== undefined) {
    updateExpressions.push('priority = :priority');
    expressionAttributeValues[':priority'] = updates.priority;
  }
  if (updates.assignedTo !== undefined) {
    updateExpressions.push('assignedTo = :assignedTo');
    expressionAttributeValues[':assignedTo'] = updates.assignedTo;
  }
  if (updates.startDate !== undefined) {
    updateExpressions.push('startDate = :startDate');
    expressionAttributeValues[':startDate'] = updates.startDate;
  }
  if (updates.dueDate !== undefined) {
    updateExpressions.push('dueDate = :dueDate');
    expressionAttributeValues[':dueDate'] = updates.dueDate;
  }
  if (updates.completedDate !== undefined) {
    updateExpressions.push('completedDate = :completedDate');
    expressionAttributeValues[':completedDate'] = updates.completedDate;
  }
  if (updates.budget !== undefined) {
    updateExpressions.push('budget = :budget');
    expressionAttributeValues[':budget'] = updates.budget;
  }
  if (updates.actualCost !== undefined) {
    updateExpressions.push('actualCost = :actualCost');
    expressionAttributeValues[':actualCost'] = updates.actualCost;
  }
  if (updates.tags !== undefined) {
    updateExpressions.push('tags = :tags');
    expressionAttributeValues[':tags'] = updates.tags;
  }

  updateExpressions.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = Date.now();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as Project;
}

export async function deleteProject(projectId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId },
    })
  );
}

