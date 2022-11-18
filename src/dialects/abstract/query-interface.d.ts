import { DataType } from '../../data-types';
import {
  Logging,
  Model,
  ModelAttributeColumnOptions,
  ModelAttributes,
  WhereOptions,
  Filterable,
  ModelStatic,
  ModelType,
  CreationAttributes,
  Attributes,
} from '../../model';
import { Sequelize, QueryOptions, QueryOptionsWithModel, Replaceable } from '../../sequelize';
import { Transaction } from '../../transaction';
import { SetRequired } from '../../utils/set-required';
import { Fn, Literal } from '../../utils';
import { Deferrable } from '../../deferrable';

interface QiOptionsWithReplacements extends QueryOptions {}

export interface QiInsertOptions extends QueryOptions, Replaceable {
  returning?: boolean | string[];
}

export interface QiSelectOptions extends QueryOptions, Replaceable, Filterable<any> {

}

export interface QiUpdateOptions extends QueryOptions, Replaceable {
  returning?: boolean | string[];
}

export interface QiDeleteOptions extends QueryOptions, Replaceable {
  limit?: number | Literal | null | undefined;
}

export interface QiArithmeticOptions extends QueryOptions, Replaceable {
  returning?: boolean | string[];
}

export interface QiUpsertOptions<M extends Model> extends QueryOptionsWithModel<M>, Replaceable {

}

export interface CreateFunctionOptions extends QueryOptions {
  force?: boolean;
}

export interface CollateCharsetOptions {
  collate?: string;
  charset?: string;
}

export interface QueryInterfaceCreateTableOptions extends QueryOptions, CollateCharsetOptions {
  engine?: string;
  /**
   * Used for compound unique keys.
   */
  uniqueKeys?: {
    [keyName: string]: {
      fields: string[],
      customIndex?: boolean,
    },
  };
}

export interface QueryInterfaceDropTableOptions extends QueryOptions {
  cascade?: boolean;
  force?: boolean;
}

export interface QueryInterfaceDropAllTablesOptions extends QueryOptions {
  skip?: string[];
}

export interface TableNameWithSchema {
  tableName: string;
  schema?: string;
  delimiter?: string;
  as?: string;
  name?: string;
}
export type TableName = string | TableNameWithSchema;

export type IndexType = 'UNIQUE' | 'FULLTEXT' | 'SPATIAL';
export type IndexMethod = 'BTREE' | 'HASH' | 'GIST' | 'SPGIST' | 'GIN' | 'BRIN' | string;

export interface IndexesOptions {
  /**
   * The name of the index. Defaults to model name + _ + fields concatenated
   */
  name?: string;

  /** For FULLTEXT columns set your parser */
  parser?: string | null;

  /**
   * Index type. Only used by mysql. One of `UNIQUE`, `FULLTEXT` and `SPATIAL`
   */
  type?: IndexType;

  /**
   * Should the index by unique? Can also be triggered by setting type to `UNIQUE`
   *
   * @default false
   */
  unique?: boolean;

  /**
   * PostgreSQL will build the index without taking any write locks. Postgres only
   *
   * @default false
   */
  concurrently?: boolean;

  /**
   * An array of the fields to index. Each field can either be a string containing the name of the field,
   * a sequelize object (e.g `sequelize.fn`), or an object with the following attributes: `name`
   * (field name), `length` (create a prefix index of length chars), `order` (the direction the column
   * should be sorted in), `collate` (the collation (sort order) for the column), `operator` (likes IndexesOptions['operator'])
   */
  fields?: (string | { name: string; length?: number; order?: 'ASC' | 'DESC'; collate?: string; operator?: string } | Fn | Literal)[];

  /**
   * The method to create the index by (`USING` statement in SQL). BTREE and HASH are supported by mysql and
   * postgres, and postgres additionally supports GIST, SPGIST, BRIN and GIN.
   */
  using?: IndexMethod;

  /**
   * Index operator type. Postgres only
   */
  operator?: string;

  /**
   * Optional where parameter for index. Can be used to limit the index to certain rows.
   */
  where?: WhereOptions<any>;

  /**
   * Prefix to append to the index name.
   */
  prefix?: string;
}

export interface QueryInterfaceIndexOptions extends IndexesOptions, Omit<QiOptionsWithReplacements, 'type'> {}

export interface BaseConstraintOptions {
  name?: string;
  fields: string[];
}

export interface AddUniqueConstraintOptions extends BaseConstraintOptions {
  type: 'unique';
  deferrable?: Deferrable;
}

export interface AddDefaultConstraintOptions extends BaseConstraintOptions {
  type: 'default';
  defaultValue?: unknown;
}

export interface AddCheckConstraintOptions extends BaseConstraintOptions {
  type: 'check';
  where?: WhereOptions<any>;
}

export interface AddPrimaryKeyConstraintOptions extends BaseConstraintOptions {
  type: 'primary key';
  deferrable?: Deferrable;
}

export interface AddForeignKeyConstraintOptions extends BaseConstraintOptions {
  type: 'foreign key';
  references?: {
    table: TableName;
    field: string;
  };
  onDelete: string;
  onUpdate: string;
  deferrable?: Deferrable;
}

export type AddConstraintOptions =
| AddUniqueConstraintOptions
| AddDefaultConstraintOptions
| AddCheckConstraintOptions
| AddPrimaryKeyConstraintOptions
| AddForeignKeyConstraintOptions;

export interface CreateDatabaseOptions extends CollateCharsetOptions, QueryOptions {
  encoding?: string;
}

export interface FunctionParam {
  type: string;
  name?: string;
  direction?: string;
}

export interface ColumnDescription {
  type: string;
  allowNull: boolean;
  defaultValue: string;
  primaryKey: boolean;
  autoIncrement: boolean;
  comment: string | null;
}

export interface ColumnsDescription {
  [key: string]: ColumnDescription;
}

/**
* The interface that Sequelize uses to talk to all databases.
*
* This interface is available through sequelize.queryInterface. It should not be commonly used, but it's
* referenced anyway, so it can be used.
*/
export class QueryInterface {
  /**
   * Returns the dialect-specific sql generator.
   *
   * We don't have a definition for the QueryGenerator, because I doubt it is commonly in use separately.
   */
  public queryGenerator: unknown;

  /**
   * Returns the current sequelize instance.
   */
  public sequelize: Sequelize;

  constructor(sequelize: Sequelize);

  /**
   * Queries the schema (table list).
   *
   * @param schema The schema to query. Applies only to Postgres.
   */
  public createSchema(schema?: string, options?: QueryOptions): Promise<void>;

  /**
   * Drops the specified schema (table).
   *
   * @param schema The schema to query. Applies only to Postgres.
   */
  public dropSchema(schema?: string, options?: QueryOptions): Promise<void>;

  /**
   * Drops all tables.
   */
  public dropAllSchemas(options?: QueryInterfaceDropAllTablesOptions): Promise<void>;

  /**
   * Queries all table names in the database.
   *
   * @param options
   */
  public showAllSchemas(options?: QueryOptions): Promise<object>;

  /**
   * Return database version
   */
  public databaseVersion(options?: QueryOptions): Promise<string>;

  /**
   * Creates a table with specified attributes.
   *
   * @param tableName     Name of table to create
   * @param attributes    Hash of attributes, key is attribute name, value is data type
   * @param options       Table options.
   */
  public createTable<M extends Model>(
    tableName: TableName,
    attributes: ModelAttributes<M, CreationAttributes<M>>,
    options?: QueryInterfaceCreateTableOptions
  ): Promise<void>;

  /**
   * Drops the specified table.
   *
   * @param tableName Table name.
   * @param options   Query options, particularly "force".
   */
  public dropTable(tableName: TableName, options?: QueryInterfaceDropTableOptions): Promise<void>;

  /**
   * Drops all tables.
   *
   * @param options
   */
  public dropAllTables(options?: QueryInterfaceDropAllTablesOptions): Promise<void>;

  /**
   * Drops all defined enums
   *
   * @param options
   */
  public dropAllEnums(options?: QueryOptions): Promise<void>;

  /**
   * Renames a table
   */
  public renameTable(before: TableName, after: TableName, options?: QueryOptions): Promise<void>;

  /**
   * Returns all tables
   */
  public showAllTables(options?: QueryOptions): Promise<string[]>;

  /**
   * Returns a promise that resolves to true if the table exists in the database, false otherwise.
   *
   * @param tableName The name of the table
   * @param options Options passed to {@link Sequelize#query}
   */
  public tableExists(tableName: TableName, options?: QueryOptions): Promise<boolean>;

  /**
   * Describe a table
   */
  public describeTable(
    tableName: TableName,
    options?: string | { schema?: string; schemaDelimiter?: string } & Logging
  ): Promise<ColumnsDescription>;

  /**
   * Adds a new column to a table
   */
  public addColumn(
    table: TableName,
    key: string,
    attribute: ModelAttributeColumnOptions | DataType,
    options?: QiOptionsWithReplacements
  ): Promise<void>;

  /**
   * Removes a column from a table
   */
  public removeColumn(
    table: TableName,
    attribute: string,
    options?: QiOptionsWithReplacements
  ): Promise<void>;

  /**
   * Changes a column
   */
  public changeColumn(
    tableName: TableName,
    attributeName: string,
    dataTypeOrOptions?: DataType | ModelAttributeColumnOptions,
    options?: QiOptionsWithReplacements
  ): Promise<void>;

  /**
   * Renames a column
   */
  public renameColumn(
    tableName: TableName,
    attrNameBefore: string,
    attrNameAfter: string,
    options?: QiOptionsWithReplacements
  ): Promise<void>;

  /**
   * Adds a new index to a table
   */
  public addIndex(
    tableName: TableName,
    attributes: string[],
    options?: QueryInterfaceIndexOptions,
    rawTablename?: string
  ): Promise<void>;
  public addIndex(
    tableName: TableName,
    options: SetRequired<QueryInterfaceIndexOptions, 'fields'>,
    rawTablename?: string
  ): Promise<void>;

  /**
   * Removes an index of a table
   */
  public removeIndex(tableName: TableName, indexName: string, options?: QueryInterfaceIndexOptions): Promise<void>;
  public removeIndex(tableName: TableName, attributes: string[], options?: QueryInterfaceIndexOptions): Promise<void>;

  /**
   * Adds constraints to a table
   */
  public addConstraint(
    tableName: TableName,
    options?: AddConstraintOptions & QueryOptions
  ): Promise<void>;

  /**
   * Removes constraints from a table
   */
  public removeConstraint(tableName: TableName, constraintName: string, options?: QueryOptions): Promise<void>;

  /**
   * Shows the index of a table
   */
  public showIndex(tableName: string | object, options?: QueryOptions): Promise<object>;

  /**
   * Put a name to an index
   */
  public nameIndexes(indexes: string[], rawTablename: string): Promise<void>;

  /**
   * Returns all foreign key constraints of requested tables
   */
  public getForeignKeysForTables(tableNames: string[], options?: QueryOptions): Promise<object>;

  /**
   * Get foreign key references details for the table
   */
  public getForeignKeyReferencesForTable(tableName: TableName, options?: QueryOptions): Promise<object>;

  /**
   * Inserts a new record
   */
  public insert(instance: Model | null, tableName: string, values: object, options?: QiInsertOptions): Promise<object>;

  /**
   * Inserts or Updates a record in the database
   */
  public upsert<M extends Model>(
    tableName: TableName,
    insertValues: object,
    updateValues: object,
    where: object,
    options?: QiUpsertOptions<M>
  ): Promise<object>;

  /**
   * Inserts multiple records at once
   */
  public bulkInsert(
    tableName: TableName,
    records: object[],
    options?: QiOptionsWithReplacements,
    attributes?: Record<string, ModelAttributeColumnOptions>
  ): Promise<object | number>;

  /**
   * Updates a row
   */
  public update<M extends Model>(
    instance: M,
    tableName: TableName,
    values: object,
    identifier: WhereOptions<Attributes<M>>,
    options?: QiUpdateOptions
  ): Promise<object>;

  /**
   * Updates multiple rows at once
   */
  public bulkUpdate(
    tableName: TableName,
    values: object,
    identifier: WhereOptions<any>,
    options?: QiOptionsWithReplacements,
    attributes?: string[] | string
  ): Promise<object>;

  /**
   * Deletes a row
   */
  public delete(
    instance: Model | null,
    tableName: TableName,
    identifier: WhereOptions<any>,
    options?: QiDeleteOptions
  ): Promise<object>;

  /**
   * Deletes multiple rows at once
   */
  public bulkDelete(
    tableName: TableName,
    identifier: WhereOptions<any>,
    options?: QiOptionsWithReplacements,
    model?: ModelType
  ): Promise<object>;

  /**
   * Returns selected rows
   */
  public select(model: ModelType | null, tableName: TableName, options?: QiSelectOptions): Promise<object[]>;

  /**
   * Increments a row value
   */
  public increment<M extends Model>(
    instance: Model,
    tableName: TableName,
    values: object,
    identifier: WhereOptions<Attributes<M>>,
    options?: QiArithmeticOptions
  ): Promise<object>;

  /**
   * Decrements a row value
   */
  decrement<M extends Model>(
    model: ModelStatic<M>,
    tableName: TableName,
    incrementAmountsByField: object,
    extraAttributesToBeUpdated?: object,
    where?: WhereOptions<Attributes<M>>,
    options?: QiArithmeticOptions,
  ): Promise<object>;

  /**
   * Selects raw without parsing the string into an object
   */
  public rawSelect(
    tableName: TableName,
    options: QiSelectOptions,
    attributeSelector: string | string[],
    model?: ModelType
  ): Promise<string[]>;

  /**
   * Postgres only. Creates a trigger on specified table to call the specified function with supplied
   * parameters.
   */
  public createTrigger(
    tableName: TableName,
    triggerName: string,
    timingType: string,
    fireOnArray: Array<'update' | 'insert' | 'delete' | 'truncate'>,
    functionName: string,
    functionParams: FunctionParam[],
    optionsArray: string[],
    options?: QiOptionsWithReplacements
  ): Promise<void> | Error;

  /**
   * Postgres only. Drops the specified trigger.
   */
  public dropTrigger(tableName: TableName, triggerName: string, options?: QiOptionsWithReplacements): Promise<void>;

  /**
   * Postgres only. Renames a trigger
   */
  public renameTrigger(
    tableName: TableName,
    oldTriggerName: string,
    newTriggerName: string,
    options?: QiOptionsWithReplacements
  ): Promise<void>;

  /**
   * Postgres only. Create a function
   */
  public createFunction(
    functionName: string,
    params: FunctionParam[],
    returnType: string,
    language: string,
    body: string,
    optionsArray?: string[],
    options?: CreateFunctionOptions
  ): Promise<void>;

  /**
   * Postgres only. Drops a function
   */
  public dropFunction(functionName: string, params: FunctionParam[], options?: QiOptionsWithReplacements): Promise<void>;

  /**
   * Postgres only. Rename a function
   */
  public renameFunction(
    oldFunctionName: string,
    params: FunctionParam[],
    newFunctionName: string,
    options?: QiOptionsWithReplacements
  ): Promise<void>;

  /**
   * Escape a table name
   */
  public quoteTable(identifier: TableName): string;

  /**
   * Escape an identifier (e.g. a table or attribute name). If force is true, the identifier will be quoted
   * even if the `quoteIdentifiers` option is false.
   */
  public quoteIdentifier(identifier: string, force?: boolean): string;

  /**
   * Split an identifier into .-separated tokens and quote each part.
   */
  public quoteIdentifiers(identifiers: string): string;

  /**
   * Escape a value (e.g. a string, number or date)
   */
  public escape(value?: string | number | Date): string;

  /**
   * Set option for autocommit of a transaction
   */
  public setAutocommit(transaction: Transaction, value: boolean, options?: QueryOptions): Promise<void>;

  /**
   * Set the isolation level of a transaction
   */
  public setIsolationLevel(transaction: Transaction, value: string, options?: QueryOptions): Promise<void>;

  /**
   * Begin a new transaction
   */
  public startTransaction(transaction: Transaction, options?: QueryOptions): Promise<void>;

  /**
   * Defer constraints
   */
  public deferConstraints(transaction: Transaction, options?: QueryOptions): Promise<void>;

  /**
   * Commit an already started transaction
   */
  public commitTransaction(transaction: Transaction, options?: QueryOptions): Promise<void>;

  /**
   * Rollback ( revert ) a transaction that has'nt been commited
   */
  public rollbackTransaction(transaction: Transaction, options?: QueryOptions): Promise<void>;

  /**
   * Creates a database
   */
  public createDatabase(name: string, options?: CreateDatabaseOptions): Promise<void>;

  /**
   * Creates a database
   */
  public dropDatabase(name: string, options?: QueryOptions): Promise<void>;
}
