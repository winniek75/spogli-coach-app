declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        requestAccessToken(): void
      }
      interface TokenResponse {
        access_token?: string
        error?: string
      }
      function initTokenClient(config: {
        client_id: string
        scope: string
        callback: (response: TokenResponse) => void
      }): TokenClient
    }
  }

  namespace picker {
    enum ViewId {
      DOCS = 'all',
      DOCS_IMAGES = 'docs-images',
      DOCS_IMAGES_AND_VIDEOS = 'docs-images-and-videos',
      DOCS_VIDEOS = 'docs-videos',
      DOCUMENTS = 'documents',
      FOLDERS = 'folders',
      FORMS = 'forms',
      PDFS = 'pdfs',
      PHOTOS = 'photos',
      PRESENTATIONS = 'presentations',
      SPREADSHEETS = 'spreadsheets',
    }

    enum Action {
      CANCEL = 'cancel',
      PICKED = 'picked',
    }

    interface Document {
      id: string
      name: string
      mimeType: string
      url: string
    }

    interface ResponseObject {
      action: Action
      docs: Document[]
    }

    class DocsView {
      constructor(viewId?: ViewId)
      setIncludeFolders(include: boolean): DocsView
      setSelectFolderEnabled(enabled: boolean): DocsView
      setMimeTypes(mimeTypes: string): DocsView
    }

    class PickerBuilder {
      addView(view: DocsView): PickerBuilder
      setOAuthToken(token: string): PickerBuilder
      setDeveloperKey(key: string): PickerBuilder
      setCallback(callback: (data: ResponseObject) => void): PickerBuilder
      setTitle(title: string): PickerBuilder
      setLocale(locale: string): PickerBuilder
      build(): Picker
    }

    class Picker {
      setVisible(visible: boolean): void
    }
  }
}

interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void
  }
}
