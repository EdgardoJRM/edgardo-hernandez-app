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
export declare function getFormById(formId: string): Promise<Form | null>;
export declare function getAllForms(): Promise<Form[]>;
//# sourceMappingURL=form.d.ts.map