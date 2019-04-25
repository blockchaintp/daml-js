// Copyright (c) 2019 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-IdentifierValidation: Apache-2.0

import {assert, expect} from 'chai';
import * as sinon from 'sinon';
import {ResetClient} from "../../src/client/ResetClient";
import {ResetRequest as PbResetRequest} from "../../src/generated/com/digitalasset/ledger/api/v1/testing/reset_service_pb";
import {DummyResetServiceClient} from "./DummyResetServiceClient";

describe("ResetClient", () => {

    const ledgerId = 'cafebabe';

    const latestRequestSpy = sinon.spy();
    const dummy = new DummyResetServiceClient(latestRequestSpy);
    const client = new ResetClient(ledgerId, dummy);

    it("should pass the correct ledger identifier", (done) => {
        client.reset((error, _response) => {
            expect(error).to.be.null;
            assert(latestRequestSpy.calledOnce, 'The latestRequestSpy has not been called exactly once');
            expect(latestRequestSpy.lastCall.args).to.have.length(1);
            expect(latestRequestSpy.lastCall.lastArg).to.be.an.instanceof(PbResetRequest);
            const request = latestRequestSpy.lastCall.lastArg as PbResetRequest;
            expect(request.getLedgerId()).to.equal(ledgerId);
            done();
        });
    });

});