import ExpoModulesCore

public class RnPollardKangarooModule: Module {
    
    private var kangarooInstance: WasmKangaroo?

  public func definition() -> ModuleDefinition {
    Name("RnPollardKangaroo")

      // Initialize the Kangaroo singleton
      AsyncFunction("initializeKangaroo") { (tableMapJSON: String) in
          do {
              // Try initializing the KangarooInstance
              kangarooInstance = try createKangaroo(paramsJson: tableMapJSON)
              return true
          } catch {
              // Catch and throw the error
              throw NSError(domain: "RnPollardKangarooModuleError", code: 1, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          }
      }
      
      // Solve DLP using the initialized KangarooInstance
      AsyncFunction("solveDlp") { (pkData: Data) -> UInt64 in
          do {
              // Call solveDlp and return result
              guard let result = kangarooInstance?.solveDlp(pk: pkData) else {
                  throw NSError(domain: "RnPollardKangarooModuleError", code: 3, userInfo: [NSLocalizedDescriptionKey: "KangarooInstance not initialized!"])
              }
              
              return result
          } catch {
              throw NSError(domain: "RnPollardKangarooModuleError", code: 3, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          }
      }
  }
}
