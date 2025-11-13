import fs from "fs";
import path from "path";
import { format } from "@fast-csv/format";
import ExcelJS from "exceljs";
import { PlayerService } from "../player/PlayerService";
import { ExportFilters } from "../../types";

export class ExportService {
  private playerService: PlayerService;

  constructor() {
    this.playerService = new PlayerService();
  }

  /**
   * Flatten player data for export
   */
  private flattenPlayers(players: any[]): any[] {
    return players.map((player) => ({
      "Player ID": player.id,
      "External ID": player.externalPlayerId,
      "Short Name": player.shortName,
      "Long Name": player.longName,
      "Date of Birth": player.dob,
      "Nationality": player.nationality?.name || "",
      "FIFA Version": player.latestVersion?.fifaVersion || "",
      "Overall": player.latestVersion?.overall || "",
      "Potential": player.latestVersion?.potential || "",
      "Age": player.latestVersion?.age || "",
      "Positions": player.latestVersion?.positions || "",
      "Club": player.latestVersion?.club?.name || "",
      "Value (EUR)": player.latestVersion?.valueEur || "",
      "Player URL": player.playerUrl || "",
    }));
  }

  /**
   * Export large datasets to CSV using streams (memory-safe)
   */
  async exportToCSVStream(filters: ExportFilters): Promise<string> {
    const filename = `players_export_${Date.now()}.csv`;
    const filePath = path.join(process.cwd(), filename);

    const writeStream = fs.createWriteStream(filePath);
    const csvStream = format({ headers: true });
    csvStream.pipe(writeStream);

    let page = 1;
    const limit = 5000;

    while (true) {
      const { players } = await this.playerService.getPlayers({
        ...filters,
        limit,
        page,
      });

      if (!players.length) break;

      const flattenedData = this.flattenPlayers(players);
      for (const row of flattenedData) csvStream.write(row);

      page++;
    }

    csvStream.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    return filePath;
  }

  /**
   * Export to Excel using exceljs (streaming + memory safe)
   */
  async exportToExcel(filters: ExportFilters): Promise<string> {
    const filename = `players_export_${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), filename);

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      filename: filePath,
      useStyles: true,
    });
    const worksheet = workbook.addWorksheet("Players");

    // Definir encabezados
    const columns = [
      "Player ID",
      "External ID",
      "Short Name",
      "Long Name",
      "Date of Birth",
      "Nationality",
      "FIFA Version",
      "Overall",
      "Potential",
      "Age",
      "Positions",
      "Club",
      "Value (EUR)",
      "Player URL",
    ];

    worksheet.columns = columns.map((header) => ({
      header,
      key: header,
      width: 20,
    }));

    // Cargar datos por lotes
    let page = 1;
    const limit = 5000;

    while (true) {
      const { players } = await this.playerService.getPlayers({
        ...filters,
        limit,
        page,
      });

      if (!players.length) break;

      const flattenedData = this.flattenPlayers(players);
      for (const row of flattenedData) worksheet.addRow(row).commit();

      page++;
    }

    worksheet.commit();
    await workbook.commit();

    return filePath;
  }

  /**
   * Main export entrypoint
   */
  async export(
    filters: ExportFilters
  ): Promise<{
    data: string | Buffer;
    contentType: string;
    filename: string;
    isFile: boolean;
  }> {
    const formatType = filters.format || "csv";

    if (formatType === "csv") {
      const filePath = await this.exportToCSVStream(filters);
      return {
        data: filePath,
        contentType: "text/csv",
        filename: path.basename(filePath),
        isFile: true,
      };
    }

    if (formatType === "xlsx") {
      const filePath = await this.exportToExcel(filters);
      return {
        data: filePath,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: path.basename(filePath),
        isFile: true,
      };
    }

    throw new Error("Invalid export format");
  }
}