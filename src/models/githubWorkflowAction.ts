export interface GitHubWorkflowAction {
    action: string; // "completed", "started", etc.
    workflow_job: {
        id: number;
        run_id: number;
        workflow_name: string;
        head_branch: string;
        run_url: string;
        run_attempt: number;
        node_id: string;
        head_sha: string;
        url: string;
        html_url: string;
        status: string; // "completed", "in_progress", etc.
        conclusion: string; // "success", "failure", etc.
        created_at: string;
        started_at: string;
        completed_at: string;
        name: string;
        steps: Array<{
            name: string;
            status: string; // "completed", "in_progress", etc.
            conclusion: string; // "success", "failure", etc.
            number: number;
            started_at: string;
            completed_at: string;
        }>;
        check_run_url: string;
        labels: string[];
        runner_id: number;
        runner_name: string;
        runner_group_id: number;
        runner_group_name: string;
    };
    repository: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        private: boolean;
        owner: {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            url: string;
            html_url: string;
        };
        html_url: string;
        description: string | null;
        fork: boolean;
        created_at: string;
        updated_at: string;
        pushed_at: string;
        git_url: string;
        ssh_url: string;
        clone_url: string;
        svn_url: string;
        homepage: string | null;
        size: number;
        stargazers_count: number;
        watchers_count: number;
        language: string;
        has_issues: boolean;
        has_projects: boolean;
        has_downloads: boolean;
        has_wiki: boolean;
        has_pages: boolean;
        has_discussions: boolean;
        forks_count: number;
        archived: boolean;
        disabled: boolean;
        open_issues_count: number;
        license: string | null;
        allow_forking: boolean;
        is_template: boolean;
        web_commit_signoff_required: boolean;
        topics: string[];
        visibility: string;
        forks: number;
        open_issues: number;
        watchers: number;
        default_branch: string;
    };
    sender: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        url: string;
        html_url: string;
        type: string; // "User", "Bot", etc.
        site_admin: boolean;
    };
}
