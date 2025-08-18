"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  FileText, Upload, Download, Share2, Edit, Trash2, Plus, Search,
  Filter, Users, Clock, Star, BookOpen, FolderOpen, File,
  Eye, MessageSquare, History, GitBranch, Lock, Unlock,
  Check, X, MoreHorizontal, Copy, ExternalLink, Settings,
  Archive, RefreshCw, Tag, ChevronDown, Folder, Image,
  Video, Music, Code, Database, Zap
} from "lucide-react"

interface Document {
  id: string
  title: string
  content: string
  type: 'document' | 'spreadsheet' | 'presentation' | 'note' | 'template'
  format: 'docx' | 'xlsx' | 'pptx' | 'md' | 'txt' | 'pdf'
  size: number
  createdBy: string
  createdAt: string
  updatedAt: string
  version: number
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  visibility: 'private' | 'team' | 'company' | 'public'
  tags: string[]
  category: string
  folder: string
  collaborators: DocumentCollaborator[]
  comments: DocumentComment[]
  isStarred: boolean
  isLocked: boolean
  downloadCount: number
  viewCount: number
  permissions: DocumentPermissions
}

interface DocumentCollaborator {
  userId: string
  userName: string
  role: 'viewer' | 'commenter' | 'editor' | 'owner'
  lastActive: string
  isOnline: boolean
}

interface DocumentComment {
  id: string
  content: string
  author: string
  createdAt: string
  isResolved: boolean
  replies: DocumentReply[]
}

interface DocumentReply {
  id: string
  content: string
  author: string
  createdAt: string
}

interface DocumentPermissions {
  canView: boolean
  canComment: boolean
  canEdit: boolean
  canShare: boolean
  canDelete: boolean
  canDownload: boolean
}

interface DocumentVersion {
  id: string
  version: number
  title: string
  changes: string
  author: string
  createdAt: string
  size: number
}

export function DocumentModule() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>("全部")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [newDocument, setNewDocument] = useState({
    title: "",
    content: "",
    type: "document" as Document['type'],
    category: "",
    folder: "文档库",
    visibility: "team" as Document['visibility'],
    tags: [] as string[]
  })

  // 模拟数据初始化
  useEffect(() => {
    initializeDocuments()
  }, [])

  const initializeDocuments = () => {
    const mockFolders = ["全部", "文档库", "项目文档", "会议记录", "模板库", "个人文档", "存档"]
    setFolders(mockFolders)

    const mockDocuments: Document[] = [
      {
        id: "doc1",
        title: "产品需求文档 v2.1",
        content: "这是产品需求文档的详细内容...",
        type: "document",
        format: "docx",
        size: 2048576,
        createdBy: "产品经理",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T15:30:00Z",
        version: 2,
        status: "review",
        visibility: "team",
        tags: ["产品", "需求", "v2.1"],
        category: "产品管理",
        folder: "项目文档",
        collaborators: [
          {
            userId: "user1",
            userName: "产品经理",
            role: "owner",
            lastActive: "2024-01-20T15:30:00Z",
            isOnline: true
          },
          {
            userId: "user2",
            userName: "技术总监",
            role: "editor",
            lastActive: "2024-01-20T14:45:00Z",
            isOnline: false
          }
        ],
        comments: [
          {
            id: "comment1",
            content: "第三章节需要补充技术实现细节",
            author: "技术总监",
            createdAt: "2024-01-20T14:45:00Z",
            isResolved: false,
            replies: []
          }
        ],
        isStarred: true,
        isLocked: false,
        downloadCount: 15,
        viewCount: 127,
        permissions: {
          canView: true,
          canComment: true,
          canEdit: true,
          canShare: true,
          canDelete: false,
          canDownload: true
        }
      },
      {
        id: "doc2",
        title: "团队周会记录 - 第8周",
        content: "会议主要内容和决策...",
        type: "note",
        format: "md",
        size: 512000,
        createdBy: "项目经理",
        createdAt: "2024-01-18T09:00:00Z",
        updatedAt: "2024-01-18T11:30:00Z",
        version: 1,
        status: "published",
        visibility: "team",
        tags: ["会议", "周报", "团队"],
        category: "会议记录",
        folder: "会议记录",
        collaborators: [
          {
            userId: "user3",
            userName: "项目经理",
            role: "owner",
            lastActive: "2024-01-18T11:30:00Z",
            isOnline: false
          }
        ],
        comments: [],
        isStarred: false,
        isLocked: true,
        downloadCount: 8,
        viewCount: 45,
        permissions: {
          canView: true,
          canComment: true,
          canEdit: false,
          canShare: true,
          canDelete: false,
          canDownload: true
        }
      },
      {
        id: "doc3",
        title: "API文档模板",
        content: "标准API文档模板...",
        type: "template",
        format: "md",
        size: 256000,
        createdBy: "技术架构师",
        createdAt: "2024-01-10T16:00:00Z",
        updatedAt: "2024-01-12T10:15:00Z",
        version: 3,
        status: "approved",
        visibility: "company",
        tags: ["模板", "API", "文档"],
        category: "开发模板",
        folder: "模板库",
        collaborators: [
          {
            userId: "user4",
            userName: "技术架构师",
            role: "owner",
            lastActive: "2024-01-12T10:15:00Z",
            isOnline: true
          }
        ],
        comments: [],
        isStarred: true,
        isLocked: false,
        downloadCount: 32,
        viewCount: 156,
        permissions: {
          canView: true,
          canComment: true,
          canEdit: true,
          canShare: true,
          canDelete: false,
          canDownload: true
        }
      }
    ]
    setDocuments(mockDocuments)
  }

  // 创建文档
  const handleCreateDocument = () => {
    if (!newDocument.title) {
      toast.error("请输入文档标题")
      return
    }

    const document: Document = {
      id: `doc_${Date.now()}`,
      title: newDocument.title,
      content: newDocument.content,
      type: newDocument.type,
      format: newDocument.type === 'document' ? 'docx' :
              newDocument.type === 'spreadsheet' ? 'xlsx' :
              newDocument.type === 'presentation' ? 'pptx' : 'md',
      size: newDocument.content.length * 8,
      createdBy: "当前用户",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      status: "draft",
      visibility: newDocument.visibility,
      tags: newDocument.tags,
      category: newDocument.category,
      folder: newDocument.folder,
      collaborators: [
        {
          userId: "current",
          userName: "当前用户",
          role: "owner",
          lastActive: new Date().toISOString(),
          isOnline: true
        }
      ],
      comments: [],
      isStarred: false,
      isLocked: false,
      downloadCount: 0,
      viewCount: 1,
      permissions: {
        canView: true,
        canComment: true,
        canEdit: true,
        canShare: true,
        canDelete: true,
        canDownload: true
      }
    }

    setDocuments(prev => [document, ...prev])
    setIsCreateModalOpen(false)
    setNewDocument({
      title: "",
      content: "",
      type: "document",
      category: "",
      folder: "文档库",
      visibility: "team",
      tags: []
    })
    toast.success("文档创建成功")
  }

  // 更新文档状态
  const updateDocumentStatus = (docId: string, status: Document['status']) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, status, updatedAt: new Date().toISOString() } : doc
    ))
    toast.success("文档状态已更新")
  }

  // 收藏/取消收藏
  const toggleStar = (docId: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, isStarred: !doc.isStarred } : doc
    ))
  }

  // 删除文档
  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId))
    toast.success("文档已删除")
  }

  // 过滤文档
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = selectedFolder === "全部" || doc.folder === selectedFolder
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus
    const matchesType = filterType === "all" || doc.type === filterType

    return matchesSearch && matchesFolder && matchesStatus && matchesType
  })

  // 获取文档类型图标
  const getDocumentIcon = (type: Document['type'], format: Document['format']) => {
    if (type === 'document') return <FileText className="h-8 w-8 text-blue-500" />
    if (type === 'spreadsheet') return <Database className="h-8 w-8 text-green-500" />
    if (type === 'presentation') return <Video className="h-8 w-8 text-orange-500" />
    if (type === 'note') return <Edit className="h-8 w-8 text-purple-500" />
    if (type === 'template') return <Copy className="h-8 w-8 text-gray-500" />
    return <File className="h-8 w-8 text-gray-400" />
  }

  // 获取状态颜色
  const getStatusColor = (status: Document['status']) => {
    const colors = {
      draft: "bg-gray-100 text-gray-600",
      review: "bg-yellow-100 text-yellow-600",
      approved: "bg-green-100 text-green-600",
      published: "bg-blue-100 text-blue-600",
      archived: "bg-red-100 text-red-600"
    }
    return colors[status]
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">文档管理</h2>
          <p className="text-sm text-gray-600">管理您的文档、模板和协作内容</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                新建文档
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建新文档</DialogTitle>
                <DialogDescription>
                  选择文档类型并填写基本信息
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">文档标题 *</Label>
                    <Input
                      id="title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入文档标题"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">文档类型</Label>
                    <Select value={newDocument.type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value as Document['type'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">文档</SelectItem>
                        <SelectItem value="note">笔记</SelectItem>
                        <SelectItem value="template">模板</SelectItem>
                        <SelectItem value="spreadsheet">表格</SelectItem>
                        <SelectItem value="presentation">演示</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">文档内容</Label>
                  <Textarea
                    id="content"
                    value={newDocument.content}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="输入文档内容..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="folder">文件夹</Label>
                    <Select value={newDocument.folder} onValueChange={(value) => setNewDocument(prev => ({ ...prev, folder: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.filter(f => f !== "全部").map(folder => (
                          <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">可见性</Label>
                    <Select value={newDocument.visibility} onValueChange={(value) => setNewDocument(prev => ({ ...prev, visibility: value as Document['visibility'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">私有</SelectItem>
                        <SelectItem value="team">团队</SelectItem>
                        <SelectItem value="company">公司</SelectItem>
                        <SelectItem value="public">公开</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Input
                    id="category"
                    value={newDocument.category}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="文档分类"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateDocument} className="bg-blue-600 hover:bg-blue-700">
                  创建文档
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            上传文件
          </Button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索文档..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="选择文件夹" />
          </SelectTrigger>
          <SelectContent>
            {folders.map(folder => (
              <SelectItem key={folder} value={folder}>{folder}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="review">审核中</SelectItem>
            <SelectItem value="approved">已批准</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
            <SelectItem value="archived">已存档</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 文档列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {getDocumentIcon(doc.type, doc.format)}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStar(doc.id)
                    }}
                  >
                    <Star className={`h-4 w-4 ${doc.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status === 'draft' ? '草稿' :
                     doc.status === 'review' ? '审核中' :
                     doc.status === 'approved' ? '已批准' :
                     doc.status === 'published' ? '已发布' : '已存档'}
                  </Badge>
                  {doc.isLocked && <Lock className="h-3 w-3 text-gray-400" />}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{doc.content}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {doc.viewCount}
                  </span>
                  <span className="flex items-center">
                    <Download className="h-3 w-3 mr-1" />
                    {doc.downloadCount}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {doc.collaborators.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>v{doc.version}</span>
                </div>

                <div className="text-xs text-gray-500">
                  <p>创建: {doc.createdBy}</p>
                  <p>更新: {new Date(doc.updatedAt).toLocaleDateString()}</p>
                </div>

                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{doc.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  查看
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">暂无文档</p>
            <p className="text-sm">创建您的第一个文档或上传文件</p>
          </div>
        )}
      </div>

      {/* 文档详情模态框 */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getDocumentIcon(selectedDocument.type, selectedDocument.format)}
                <span>{selectedDocument.title}</span>
                <Badge className={getStatusColor(selectedDocument.status)}>
                  {selectedDocument.status === 'draft' ? '草稿' :
                   selectedDocument.status === 'review' ? '审核中' :
                   selectedDocument.status === 'approved' ? '已批准' :
                   selectedDocument.status === 'published' ? '已发布' : '已存档'}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">内容</TabsTrigger>
                <TabsTrigger value="collaborators">协作者</TabsTrigger>
                <TabsTrigger value="comments">评论</TabsTrigger>
                <TabsTrigger value="history">历史</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedDocument.content}</p>
                </div>
              </TabsContent>

              <TabsContent value="collaborators" className="space-y-4">
                <div className="space-y-3">
                  {selectedDocument.collaborators.map((collaborator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{collaborator.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{collaborator.userName}</p>
                          <p className="text-sm text-gray-500">
                            {collaborator.role === 'owner' ? '所有者' :
                             collaborator.role === 'editor' ? '编辑者' :
                             collaborator.role === 'commenter' ? '评论者' : '查看者'}
                          </p>
                        </div>
                        {collaborator.isOnline && (
                          <Badge variant="outline" className="bg-green-50 text-green-600">
                            在线
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <div className="space-y-4">
                  {selectedDocument.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {comment.isResolved ? (
                          <Badge className="bg-green-100 text-green-600">已解决</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-600">待解决</Badge>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}

                  {selectedDocument.comments.length === 0 && (
                    <p className="text-center text-gray-500 py-8">暂无评论</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {selectedDocument.version}
                      </div>
                      <div>
                        <p className="font-medium">当前版本</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedDocument.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge>当前</Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                关闭
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
