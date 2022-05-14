// Handlers have helper methods that allow them to communicate with the server
// (initially, by converting the server's snake_case to camelCase)

export abstract class Handler {
    snakeToCamel(s: string): string {
      return s.replace(
        /([-_][a-z])/g,
        (group) => group.toUpperCase().replace('-', '').replace('_', '')
      );
    }
}