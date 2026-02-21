import React from 'react';
import { Pin, Megaphone } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Announcement } from '../../types';
interface AnnouncementCardProps {
  announcement: Announcement;
}
export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Card hoverable className="h-full">
      <CardContent>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant={
              announcement.category === 'urgent' ? 'danger' : 'default'
              }>

              {announcement.category}
            </Badge>
            {announcement.isPinned &&
            <span className="flex items-center text-xs font-medium text-[var(--color-primary)]">
                <Pin className="w-3 h-3 mr-1" /> Pinned
              </span>
            }
          </div>
          <span className="text-xs text-gray-400">
            {new Date(announcement.date).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {announcement.title}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {announcement.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              {announcement.author.charAt(0)}
            </div>
            <span className="text-xs text-gray-500">{announcement.author}</span>
          </div>
          <button className="text-sm font-medium text-[var(--color-primary)] hover:underline">
            Read more
          </button>
        </div>
      </CardContent>
    </Card>);

}