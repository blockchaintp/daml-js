// Copyright (c) 2019 The DAML Authors. All rights reserved.
// SPDX-License-Identifier: Apache-2.0


import {object} from "./Object";
import {noFields, RequiredFieldsValidators} from "./Validation";
import {CompletionEndResponse} from "../model/CompletionEndResponse";
import {LedgerOffsetValidation} from "./LedgerOffsetValidation";

function required(): RequiredFieldsValidators<CompletionEndResponse> {
    return {
        offset: LedgerOffsetValidation
    };
}

export const CompletionEndResponseValidation = object<CompletionEndResponse>('CompletionEndResponse', required, noFields);
