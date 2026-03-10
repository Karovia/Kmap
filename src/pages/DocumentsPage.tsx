import { DocumentListItem } from '../components/documents/DocumentListItem';
import { DocumentsEmptyState } from '../components/documents/DocumentsEmptyState';
import { DocumentsFeedback } from '../components/documents/DocumentsFeedback';
import { DocumentsToolbar } from '../components/documents/DocumentsToolbar';
import { useDocuments } from '../hooks/useDocuments';
import { usePlatformStore } from '../stores/platformStore';

export function DocumentsPage() {
  const isNativeApp = usePlatformStore(state => state.isNativeApp);
  const {
    loading,
    uploading,
    uploadProgress,
    error,
    success,
    searchQuery,
    activeFilter,
    deletingId,
    fileInputRef,
    filters,
    filteredDocuments,
    setSearchQuery,
    setActiveFilter,
    handleFileUpload,
    handleNativeFilePick,
    handleDelete,
  } = useDocuments();

  return (
    <div className="bg-white min-h-screen pb-24">
      <DocumentsToolbar
        uploading={uploading}
        uploadProgress={uploadProgress}
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        filters={filters}
        fileInputRef={fileInputRef}
        onSearchChange={setSearchQuery}
        onFilterChange={setActiveFilter}
        onFileUpload={handleFileUpload}
        onNativeFilePick={handleNativeFilePick}
        isNativeApp={isNativeApp}
      />

      <main className="px-4 py-6 space-y-1">
        <DocumentsFeedback error={error} success={success} />

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="w-20 h-6 bg-slate-200 rounded-full" />
            </div>
          ))
        ) : filteredDocuments.length === 0 ? (
          <DocumentsEmptyState
            searchQuery={searchQuery}
            isAllFilter={activeFilter === 'all'}
            onUploadClick={() => fileInputRef.current?.click()}
          />
        ) : (
          filteredDocuments.map(doc => (
            <div key={doc.id}>
              <DocumentListItem
                doc={doc}
                deleting={deletingId === doc.id}
                onDelete={handleDelete}
              />
            </div>
          ))
        )}
      </main>
    </div>
  );
}
