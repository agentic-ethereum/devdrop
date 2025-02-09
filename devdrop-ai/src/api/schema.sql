-- Create contributor_data table
CREATE TABLE IF NOT EXISTS contributor_data (
    contributor VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    contributions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contributor, repo_name)
);

-- Create contribution_evaluations table
CREATE TABLE IF NOT EXISTS contribution_evaluations (
    contributor VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    reward_points DECIMAL(20, 6) NOT NULL,
    justification TEXT NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contributor, repo_name)
);

-- Create repo_airdrops table
CREATE TABLE IF NOT EXISTS repo_airdrops (
    repo_name VARCHAR(255) PRIMARY KEY,
    airdrop_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_tokens BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create User table if not exists (for storing GitHub tokens)
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    "githubAccessToken" VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);