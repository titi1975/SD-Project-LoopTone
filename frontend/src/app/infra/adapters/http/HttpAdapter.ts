import axios, { AxiosError, type AxiosInstance } from "axios";
import { environment } from "../../config/environment";
import { HttpError } from "../../errors/http-error";
import type { HttpResponse } from "./HttpResponse";

class HttpAdapter {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: environment.apiBaseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async post<TResponse, TBody>(url: string, body: TBody): Promise<HttpResponse<TResponse>> {
    try {
      const response = await this.client.post<TResponse>(url, body);
      return { status: response.status, data: response.data };
    } catch (error) {
      throw normalizeHttpError(error);
    }
  }

  async get<TResponse>(url: string): Promise<HttpResponse<TResponse>> {
    try {
      const response = await this.client.get<TResponse>(url);
      return { status: response.status, data: response.data };
    } catch (error) {
      throw normalizeHttpError(error);
    }
  }

  async put<TResponse, TBody>(url: string, body: TBody): Promise<HttpResponse<TResponse>> {
    try {
      const response = await this.client.put<TResponse>(url, body);
      return { status: response.status, data: response.data };
    } catch (error) {
      throw normalizeHttpError(error);
    }
  }

  async delete<TResponse>(url: string): Promise<HttpResponse<TResponse>> {
    try {
      const response = await this.client.delete<TResponse>(url);
      return { status: response.status, data: response.data };
    } catch (error) {
      throw normalizeHttpError(error);
    }
  }
}

function normalizeHttpError(error: unknown): HttpError {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return new HttpError("Nao consegui conectar na API. Confirme se o backend esta rodando em http://localhost:8000.");
    }

    const detail = error.response.data as { message?: string; detail?: unknown } | undefined;
    const message =
      detail?.message ??
      formatValidationDetail(detail?.detail) ??
      `A API respondeu com erro ${error.response.status}.`;

    return new HttpError(message, error.response.status);
  }

  return new HttpError("Nao foi possivel conectar ao servidor.");
}

function formatValidationDetail(detail: unknown): string | undefined {
  if (typeof detail === "string") {
    return detail;
  }

  if (!Array.isArray(detail)) {
    return undefined;
  }

  const messages = detail
    .map((item) => {
      if (!item || typeof item !== "object") {
        return undefined;
      }

      const record = item as { loc?: Array<string | number>; msg?: string };
      const field = record.loc?.filter((part) => part !== "body").join(".");
      return record.msg ? `${field ? `${field}: ` : ""}${record.msg}` : undefined;
    })
    .filter(Boolean);

  return messages.length > 0 ? messages.join(" ") : "Verifique os campos informados.";
}

export const httpAdapter = new HttpAdapter();
