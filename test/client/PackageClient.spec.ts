// Copyright (c) 2019 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-IdentifierValidation: Apache-2.0

import {assert, expect} from 'chai';
import * as sinon from 'sinon';
import {PackageClient} from "../../src/client/PackageClient";
import {
    GetPackageRequest as PbGetPackageRequest,
    GetPackageStatusRequest as PbGetPackageStatusRequest,
    ListPackagesRequest as PbListPackagesRequest
} from "../../src/generated/com/digitalasset/ledger/api/v1/package_service_pb";
import {DummyPackageServiceClient} from "./DummyPackageServiceClient";

describe("PackageClient", () => {

    const ledgerId = 'some-cool-id';
    const latestRequestSpy = sinon.spy();

    const dummy = new DummyPackageServiceClient(latestRequestSpy);
    const client = new PackageClient(ledgerId, dummy);

    afterEach(() => {
        sinon.restore();
        latestRequestSpy.resetHistory();
    });

    it("should send the request with the correct ledger identifier", (done) => {
        client.listPackages((error, _response) => {
            expect(error).to.be.null;
            assert(latestRequestSpy.calledOnce, 'The latestRequestSpy has not been called exactly once');
            expect(latestRequestSpy.lastCall.args).to.have.length(1);
            expect(latestRequestSpy.lastCall.lastArg).to.be.an.instanceof(PbListPackagesRequest);
            const request = latestRequestSpy.lastCall.lastArg as PbListPackagesRequest;
            expect(request.getLedgerId()).to.equal(ledgerId);
            done();
        });
    });

    it("should send the package request with the correct package identifier", (done) => {
        client.getPackage('package-2', (error, _response) => {
            expect(error).to.be.null;
            assert(latestRequestSpy.calledOnce, 'The latestRequestSpy has not been called exactly once');
            expect(latestRequestSpy.lastCall.args).to.have.length(1);
            expect(latestRequestSpy.lastCall.lastArg).to.be.an.instanceof(PbGetPackageRequest);
            const request = latestRequestSpy.lastCall.lastArg as PbGetPackageRequest;
            expect(request.getLedgerId()).to.equal(ledgerId);
            expect(request.getPackageId()).to.equal('package-2');
            done();
        });
    });

    it("should send the package status request with the correct package identifier", (done) => {
        client.getPackageStatus('package-2', (error, _response) => {
            expect(error).to.be.null;
            assert(latestRequestSpy.calledOnce, 'The latestRequestSpy has not been called exactly once');
            expect(latestRequestSpy.lastCall.args).to.have.length(1);
            expect(latestRequestSpy.lastCall.lastArg).to.be.an.instanceof(PbGetPackageStatusRequest);
            const request = latestRequestSpy.lastCall.lastArg as PbGetPackageStatusRequest;
            expect(request.getLedgerId()).to.equal(ledgerId);
            expect(request.getPackageId()).to.equal('package-2');
            done();
        });
    });

});