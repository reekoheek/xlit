import { Schema } from './Schema.js';
import { BooleanField } from './fields/BooleanField.js';
import { NumberField } from './fields/NumberField.js';
import { ObjectField } from './fields/ObjectField.js';
import { StringField } from './fields/StringField.js';
import { assert } from '@open-wc/testing';
import { SchemaError } from './SchemaError.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const schema = new Schema<any>({
  stringField: new StringField().required(),
  numberField: new NumberField().required(),
  booleanField: new BooleanField(),
  objectField: new ObjectField(),
});

describe('Schema', () => {
  describe('#cast()', () => {
    it('cast object', () => {
      assert.strictEqual(schema.cast(undefined), undefined);
      assert.strictEqual(schema.cast(null), undefined);
      assert.strictEqual(schema.cast(''), undefined);
      assert.deepStrictEqual(schema.cast({}) as unknown, {});
      assert.deepStrictEqual(schema.cast({ stringField: 'foo' }) as unknown, { stringField: 'foo' });
      assert.throws(() => schema.cast(false), /invalid object/);
    });
  });

  describe('#resolve()', () => {
    it('resolve object', async() => {
      assert.strictEqual(await schema.runFilters(undefined), undefined);
      assert.deepStrictEqual(
        await schema.runFilters({ stringField: 'foo', numberField: 10 }),
        { stringField: 'foo', numberField: 10 },
      );

      try {
        await schema.runFilters({});
        throw new Error('unexpected err');
      } catch (err) {
        if (err instanceof SchemaError) {
          assert.strictEqual(err.children.stringField.message, 'must be required');
          assert.strictEqual(err.children.numberField.message, 'must be required');
          return;
        }
        throw err;
      }
    });

    it('resolve specified fields only if partial', async() => {
      assert.deepStrictEqual(
        await schema.runFilters({ booleanField: true }, true),
        { booleanField: true },
      );
    });
  });
});
