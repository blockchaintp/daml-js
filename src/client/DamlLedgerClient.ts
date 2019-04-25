// Copyright (c) 2019 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-IdentifierValidation: Apache-2.0

import {ChannelCredentials, credentials} from 'grpc';

import {Callback, forward} from '../util/Callback';
import {LedgerClient, LedgerClientOptions} from "./LedgerClient";
import {HumanReadableReporter} from "../reporting/HumanReadableReporter";
import {ActiveContractsClient} from "./ActiveContractsClient";
import {CommandClient} from "./CommandClient";
import {ValidationReporter} from "../reporting/ValidationReporter";
import {CommandCompletionClient} from "./CommandCompletionClient";
import {ResetClient} from "./ResetClient";
import {TransactionClient} from "./TransactionClient";
import {TimeClient} from "./TimeClient";
import {LedgerConfigurationClient} from "./LedgerConfigurationClient";
import {PackageClient} from "./PackageClient";
import {LedgerIdentityClient} from "./LedgerIdentityClient";
import {CommandSubmissionClient} from "./CommandSubmissionClient";

import {LedgerIdentityServiceClient} from "../generated/com/digitalasset/ledger/api/v1/ledger_identity_service_grpc_pb";
import {GetLedgerIdentityRequest} from "../generated/com/digitalasset/ledger/api/v1/ledger_identity_service_pb";
import {ActiveContractsServiceClient} from "../generated/com/digitalasset/ledger/api/v1/active_contracts_service_grpc_pb";
import {CommandServiceClient} from "../generated/com/digitalasset/ledger/api/v1/command_service_grpc_pb";
import {CommandCompletionServiceClient} from "../generated/com/digitalasset/ledger/api/v1/command_completion_service_grpc_pb";
import {CommandSubmissionServiceClient} from "../generated/com/digitalasset/ledger/api/v1/command_submission_service_grpc_pb";
import {PackageServiceClient} from "../generated/com/digitalasset/ledger/api/v1/package_service_grpc_pb";
import {LedgerConfigurationServiceClient} from "../generated/com/digitalasset/ledger/api/v1/ledger_configuration_service_grpc_pb";
import {TimeServiceClient} from "../generated/com/digitalasset/ledger/api/v1/testing/time_service_grpc_pb";
import {TransactionServiceClient} from "../generated/com/digitalasset/ledger/api/v1/transaction_service_grpc_pb";
import {ResetServiceClient} from "../generated/com/digitalasset/ledger/api/v1/testing/reset_service_grpc_pb";

/**
 * A {@link LedgerClient} implementation that connects to an existing Ledger and provides clients to query it. To use the {@link DamlLedgerClient}
 * call the static `connect` method, passing an instance of {@link LedgerClientOptions} with the host, port and (for secure connection) the
 * necessary certificates.
 */
export class DamlLedgerClient implements LedgerClient {
    public readonly ledgerId: string;
    private readonly _activeContractsClient: ActiveContractsClient;
    private readonly _commandClient: CommandClient;
    private readonly _commandCompletionClient: CommandCompletionClient;
    private readonly _commandSubmissionClient: CommandSubmissionClient;
    private readonly _ledgerIdentityClient: LedgerIdentityClient;
    private readonly _packageClient: PackageClient;
    private readonly _ledgerConfigurationClient: LedgerConfigurationClient;
    private readonly _timeClient: TimeClient;
    private readonly _transactionClient: TransactionClient;
    private readonly _resetClient: ResetClient;

    private constructor(
        ledgerId: string,
        address: string,
        credentials: ChannelCredentials,
        reporter: ValidationReporter
    ) {
        this.ledgerId = ledgerId;
        this._activeContractsClient = new ActiveContractsClient(
            ledgerId,
            new ActiveContractsServiceClient(address, credentials),
            reporter
        );
        this._commandClient = new CommandClient(
            ledgerId,
            new CommandServiceClient(address, credentials),
            reporter
        );
        this._commandCompletionClient = new CommandCompletionClient(
            ledgerId,
            new CommandCompletionServiceClient(address, credentials),
            reporter
        );
        this._commandSubmissionClient = new CommandSubmissionClient(
            ledgerId,
            new CommandSubmissionServiceClient(address, credentials),
            reporter
        );
        this._ledgerIdentityClient = new LedgerIdentityClient(
            new LedgerIdentityServiceClient(address, credentials)
        );
        this._packageClient = new PackageClient(
            ledgerId,
            new PackageServiceClient(address, credentials)
        );
        this._ledgerConfigurationClient = new LedgerConfigurationClient(
            ledgerId,
            new LedgerConfigurationServiceClient(address, credentials)
        );
        this._timeClient = new TimeClient(
            ledgerId,
            new TimeServiceClient(address, credentials),
            reporter
        );
        this._transactionClient = new TransactionClient(
            ledgerId,
            new TransactionServiceClient(address, credentials),
            reporter
        );
        this._resetClient = new ResetClient(
            ledgerId,
            new ResetServiceClient(address, credentials)
        );
    }

    get activeContractsClient(): ActiveContractsClient {
        return this._activeContractsClient;
    }

    get commandClient(): CommandClient {
        return this._commandClient;
    }

    get commandCompletionClient(): CommandCompletionClient {
        return this._commandCompletionClient;
    }

    get commandSubmissionClient(): CommandSubmissionClient {
        return this._commandSubmissionClient;
    }

    get ledgerIdentityClient(): LedgerIdentityClient {
        return this._ledgerIdentityClient;
    }

    get packageClient(): PackageClient {
        return this._packageClient;
    }

    get ledgerConfigurationClient(): LedgerConfigurationClient {
        return this._ledgerConfigurationClient;
    }

    get timeClient(): TimeClient {
        return this._timeClient;
    }

    get transactionClient(): TransactionClient {
        return this._transactionClient;
    }

    get resetClient(): ResetClient {
        return this._resetClient;
    }

    /**
     * Connects a new instance of the {@link DamlLedgerClient} to the
     *
     * @param options The host, port and certificates needed to reach the ledger
     * @param callback A callback that will be either passed an error or the LedgerClient instance in case of successful connection
     */
    static connect(
        options: LedgerClientOptions,
        callback: Callback<LedgerClient>
    ): void {
        let creds: ChannelCredentials;
        if (!options.certChain && !options.privateKey && !options.rootCerts) {
            creds = credentials.createInsecure();
        } else if (options.certChain && options.privateKey && options.rootCerts) {
            creds = credentials.createSsl(
                options.rootCerts,
                options.privateKey,
                options.certChain
            );
        } else {
            setImmediate(() => {
                callback(
                    new Error(
                        `Incomplete information provided to establish a secure connection (certChain: ${!!options.certChain}, privateKey: ${!!options.privateKey}, rootCerts: ${!!options.rootCerts})`
                    )
                );
            });
            return;
        }

        const reporter = options.reporter || HumanReadableReporter;
        const address = `${options.host}:${options.port}`;
        const client = new LedgerIdentityServiceClient(address, creds);

        client.getLedgerIdentity(
            new GetLedgerIdentityRequest(),
            (error, response) => {
                forward(callback, error, response, response => {
                    return new DamlLedgerClient(
                        response.getLedgerId(),
                        address,
                        creds,
                        reporter
                    );
                });
            }
        );
    }
}