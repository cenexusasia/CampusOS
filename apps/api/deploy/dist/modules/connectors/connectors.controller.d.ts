import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ConnectorsService } from './connectors.service';
export declare class ConnectorsController {
    private readonly connectorsService;
    private readonly logger;
    constructor(connectorsService: ConnectorsService);
    list(user: JwtPayload): Promise<import("./connectors.service").ConnectorListItem[]>;
}
