export interface SonarIssue {
    key: string;
    rule: string;
    severity: string;
    component: string;
    project: string;
    line: number;
    hash: string;
    textRange: SonarTextRange;
    flows: any[];
    status: string;
    message: string;
    effort: string;
    debt: string;
    assignee?: string;
    author?: string;
    tags: string[];
    creationDate: string;
    updateDate: string;
    type: string;
    organization: string;
    pullRequest: string;
    cleanCodeAttribute: string;
    cleanCodeAttributeCategory: string;
    impacts: SonarImpact[];
    issueStatus: string;
}

export interface SonarTextRange {
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
}

export interface SonarImpact {
    softwareQuality: string;
    severity: string;
}

export interface SonarComponent {
    organization: string;
    key: string;
    uuid: string;
    enabled: boolean;
    qualifier: string;
    name: string;
    longName: string;
    path?: string;
    pullRequest: string;
}

export interface SonarOrganization {
    key: string;
    name: string;
}

export interface SonarPaging {
    pageIndex: number;
    pageSize: number;
    total: number;
}

export interface SonarRootObject {
    total: number;
    p: number;
    ps: number;
    paging: SonarPaging;
    effortTotal: number;
    debtTotal: number;
    issues: SonarIssue[];
    components: SonarComponent[];
    organizations: SonarOrganization[];
    facets: any[];
}
