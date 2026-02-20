import React from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Event } from '../../types';
import { SafeImage } from '../ui/SafeImage';
interface EventCardProps {
  event: Event;
  compact?: boolean;
}
export function EventCard({ event, compact = false }: EventCardProps) {
  return (
    <Card className="h-full flex flex-col group" hoverable>
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {event.imageUrl ?
        <SafeImage
          src={event.imageUrl}
          alt={event.title}
          fallbackSrc="/image-fallback.svg"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> :


        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <Calendar className="w-12 h-12 opacity-20" />
          </div>
        }
        <div className="absolute top-3 right-3">
          <Badge variant={event.isOnline ? 'info' : 'success'}>
            {event.isOnline ? 'Online' : 'In Person'}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white font-bold text-lg leading-tight">
            {event.title}
          </p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
            <span>
              {new Date(event.date).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
            <span className="truncate">{event.location}</span>
          </div>
          {!compact &&
          <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
              <span>{event.attendees} attending</span>
            </div>
          }
        </div>

        <Button variant="outline" className="w-full mt-auto">
          View Details
        </Button>
      </div>
    </Card>);

}
