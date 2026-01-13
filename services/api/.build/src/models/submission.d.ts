export interface Submission {
    submissionId: string;
    userId: string;
    formId: string;
    answersJSON: Record<string, any>;
    resultJSON: Record<string, any>;
    createdAt: number;
}
export declare function createSubmission(userId: string, formId: string, answersJSON: Record<string, any>, resultJSON: Record<string, any>): Promise<Submission>;
export declare function getSubmissionById(submissionId: string): Promise<Submission | null>;
export declare function getSubmissionsByUserId(userId: string): Promise<Submission[]>;
//# sourceMappingURL=submission.d.ts.map