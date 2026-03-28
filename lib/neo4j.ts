import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI || (process.env.NODE_ENV === 'production' ? 'bolt+s://neo4j.lexis.blog:443' : 'bolt+s://localhost:443');
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'Svoboda13Muslic!!!';

let driver: any;

export const getNeo4jDriver = () => {
    if (!driver) {
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
            maxConnectionPoolSize: 10,
            connectionTimeout: 10000,
            encrypted: true,
        });
    }
    return driver;
};

export const runQuery = async <T = any>(query: string, params?: any): Promise<T[]> => {
    const driver = getNeo4jDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, params);
        return result.records.map((record: any) => record.toObject()) as T[];
    } finally {
        await session.close();
    }
};
