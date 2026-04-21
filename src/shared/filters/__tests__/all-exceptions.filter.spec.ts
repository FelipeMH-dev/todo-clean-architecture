import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { AllExceptionsFilter } from "../all-exceptions.filter";
import { AppLogger } from "../../logger/logger.service";

function createHost(req: Request, res: Response): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: (): Request => req,
      getResponse: (): Response => res,
    }),
  } as ArgumentsHost;
}

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    errorSpy = jest
      .spyOn(AppLogger.prototype, "error")
      .mockImplementation(() => undefined);

    const logger = new AppLogger();
    filter = new AllExceptionsFilter(logger);
  });

  it("maneja HttpException con response string", () => {
    const exception = new HttpException(
      "Bad Request",
      HttpStatus.BAD_REQUEST,
    );

    const response = {
      status: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    (response.status as jest.Mock).mockReturnValue(response);

    const request = {
      method: "GET",
      url: "/test",
    } as Request;

    filter.catch(exception, createHost(request, response));

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      error: "ERROR",
      message: "Bad Request",
      code: HttpStatus.BAD_REQUEST,
    });
    expect(errorSpy).toHaveBeenCalled();
  });

  it("maneja HttpException con response object", () => {
    const exception = new HttpException(
      {
        error: "INVALID",
        message: "Invalid data",
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    const response = {
      status: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    (response.status as jest.Mock).mockReturnValue(response);

    const request = {
      method: "POST",
      url: "/test",
    } as Request;

    filter.catch(exception, createHost(request, response));

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    expect(response.json).toHaveBeenCalledWith({
      error: "INVALID",
      message: "Invalid data",
      code: HttpStatus.UNPROCESSABLE_ENTITY,
    });

    expect(errorSpy).toHaveBeenCalled();
  });

  it("maneja Error genérico", () => {
    const exception = new Error("Boom");

    const response = {
      status: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    (response.status as jest.Mock).mockReturnValue(response);

    const request = {
      method: "GET",
      url: "/error",
    } as Request;

    filter.catch(exception, createHost(request, response));

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(response.json).toHaveBeenCalledWith({
      error: "ERROR",
      message: "Boom",
      code: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    expect(errorSpy).toHaveBeenCalled();
  });
});
