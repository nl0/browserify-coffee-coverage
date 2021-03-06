var expect = require('chai').expect;
var browserify = require('browserify');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var coverage = require('../');

/**
 * Execute the instrumented javascript in its own context to verify the coverage results are valid.
 */
function execute(src) {
    var ctx = {};
    try {
        vm.runInNewContext(src, ctx);
    } catch (err) {
        console.log('Error thrown while executing instrumented code');
        console.error(err);
    }
    return ctx;
}

describe('Test istanbul instrumentation', function() {
    it('should instrument foo.coffee and mark if branch as ran', function(cb) {
        var b = browserify();
        b.add('./testFixtures/if.coffee');
        b.transform(coverage, {
            instrumentor: 'istanbul'
        });
        b.bundle(function(err, buf) {
            if (err) return cb(err);
            var results = execute(buf);
            var fooPath = path.resolve(__dirname + '/../testFixtures/foo.coffee');
            expect(results.__coverage__).to.be.ok;
            expect(results.__coverage__[fooPath].b['1']).to.eql([1, 0]);
            expect(results.__coverage__[fooPath].b['2']).to.eql([0, 0]);
            cb()
        });
    });

    it('should instrument foo.coffee and mark the else if as ran', function(cb) {
        var b = browserify();
        b.add('./testFixtures/elseIf.coffee');
        b.transform(coverage, {
            instrumentor: 'istanbul'
        });
        b.bundle(function(err, buf) {
            if (err) return cb(err);
            var results = execute(buf);
            var fooPath = path.resolve(__dirname + '/../testFixtures/foo.coffee');
            expect(results.__coverage__).to.be.ok;
            expect(results.__coverage__[fooPath].b['1']).to.eql([0, 1]);
            expect(results.__coverage__[fooPath].b['2']).to.eql([1, 0]);
            cb()
        });
    });
});
