interface DocumentsEmptyStateProps {
  searchQuery: string;
  isAllFilter: boolean;
  onUploadClick: () => void;
}

export function DocumentsEmptyState({
  searchQuery,
  isAllFilter,
  onUploadClick,
}: DocumentsEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl text-slate-400">+</span>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">暂无文档</h3>
      <p className="text-sm text-slate-500 mb-6">
        {searchQuery || !isAllFilter ? '没有找到匹配的文档' : '点击右上角上传按钮添加第一个文档'}
      </p>
      {!searchQuery && isAllFilter && (
        <button
          onClick={onUploadClick}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          上传文档
        </button>
      )}
    </div>
  );
}
