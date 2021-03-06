/* global describe, it */

// Tests suite
import path from 'path'
import chai from 'chai'
chai.should()

// The stars of the show
import Src from '../src'
import Dist from '../dist'
const envEmpty = path.resolve(__dirname, './envs/.empty')
const envEmptyExample = path.resolve(__dirname, './envs/.empty.example')
const envSimple = path.resolve(__dirname, './envs/.simple')
const envSimpleExample = path.resolve(__dirname, './envs/.simple.example')
const envMissingOne = path.resolve(__dirname, './envs/.missingone')
const envMissingOneExample = path.resolve(__dirname, './envs/.missingone.example')

const envEmptyJson = {}
const envSimpleJson = {TEST: '"testing"'}
const envMissingOneJson = {TEST: '""', TEST2: '"Hello"'}

function runTests (Obj, name) {
  function envTest (config) {
    return new Obj(config).definitions['process.env']
  }

  /** @test {Dotenv} **/
  describe(name, () => {
    describe('Defaults', () => {
      it('Should be a function.', () => {
        Obj.should.be.a.function
      })

      // @todo - This one isn't a great test, but it wasn't really working for me.
      it('Should return a instance of DefinePlugin.', () => {
        envTest().should.be.an('object')
      })

      it('Should be an empty object when no environment variables exist in .env file.', () => {
        envTest().should.deep.equal(envEmptyJson)
      })
    })

    describe('Simple configuration', () => {
      it('Should load enviornment variables when they exist in the .env file.', () => {
        envTest({path: envSimple}).should.deep.equal(envSimpleJson)
      })

      it('Should allow system env variables', () => {
        const test = envTest({path: envSimple, systemvars: true})
        const key = Object.keys(envSimpleJson)[0]
        const value = envSimpleJson[key]
        test[key].should.equal(value)
        Object.keys(test).length.should.be.above(Object.keys(envSimpleJson).length)
      })
    })

    describe('Safe configuration', () => {
      it('Should load successfully if variables defined', () => {
        envTest({path: envEmpty, safe: envEmptyExample}).should.deep.equal(envEmptyJson)
        envTest({path: envSimple, safe: envSimpleExample}).should.deep.equal(envSimpleJson)
      })

      it('Should fail if env does not match sample.', () => {
        function errorTest () {
          envTest({path: envEmpty, safe: envSimpleExample})
        }

        errorTest.should.throw('Missing environment variable')
      })
    })

    describe('Missing a variable', () => {
      it('Should load fine (not-safe)', () => {
        envTest({path: envMissingOne}).should.deep.equal(envMissingOneJson)
      })

      it('Should fail on safe mode', () => {
        function errorTest () {
          envTest({path: envMissingOne, safe: envMissingOneExample})
        }

        errorTest.should.throw('Missing environment variable')
      })
    })

    describe('Deprecated configuration', () => {
      it('Should use safe when safe and sample set', () => {
        envTest({path: envSimple, safe: true, sample: envSimpleExample}).should.deep.equal(envSimpleJson)
      })

      it('Should fail naturally when using deprecated values', () => {
        function errorTest () {
          envTest({path: envMissingOne, safe: true, sample: envMissingOneExample})
        }

        errorTest.should.throw('Missing environment variable')
      })

      it('Should not fail naturally when using deprecated values improperly', () => {
        envTest({path: envMissingOne, sample: envMissingOneExample}).should.deep.equal(envMissingOneJson)
      })
    })
  })
}

describe('Tests', () => {
  it('Should be able to run', () => {
    true.should.be.true
  })

  runTests(Src, 'Source')
  runTests(Dist, 'Distribution')
})
