export class DomainError extends Error {}

export class InvalidMessageError extends DomainError {
  constructor() {
    super("Invalid message");
  }
}
