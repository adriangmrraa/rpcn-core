/**
 * Result Pattern Utility (Supreme Law 2.1)
 * Standardizes successful values and application errors.
 */

export type AppError = {
    code: string;
    message: string;
    details?: any;
};

export class Result<T, E = AppError> {
    private constructor(
        private readonly _isSuccess: boolean,
        private readonly _error?: E,
        private readonly _value?: T
    ) {
        if (_isSuccess && _error) {
            throw new Error('InvalidOperation: A result cannot be successful and contain an error');
        }
        if (!_isSuccess && !_error) {
            throw new Error('InvalidOperation: A failing result must contain an error');
        }
    }

    public get isSuccess(): boolean {
        return this._isSuccess;
    }

    public get isFailure(): boolean {
        return !this._isSuccess;
    }

    public get error(): E {
        if (this._isSuccess) {
            throw new Error('InvalidOperation: Cannot get error from a successful result');
        }
        return this._error!;
    }

    public getValue(): T {
        if (!this._isSuccess) {
            throw new Error('InvalidOperation: Cannot get value from a failing result');
        }
        return this._value!;
    }

    public static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    public static fail<U, F = AppError>(error: F): Result<U, F> {
        return new Result<U, F>(false, error);
    }
}
