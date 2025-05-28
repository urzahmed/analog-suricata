"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import type { EveLogEntry } from "@/types/eve-log"

interface EventDetailModalProps {
  entry: EveLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailModal({ entry, open, onOpenChange }: EventDetailModalProps) {
  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Event Details
            <Badge variant="outline">{entry.event_type}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Timestamp</span>
                  <p className="font-mono text-sm">{format(new Date(entry.timestamp), "PPP pp")}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Event Type</span>
                  <p className="text-sm">{entry.event_type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Protocol</span>
                  <p className="text-sm">{entry.proto}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Interface</span>
                  <p className="font-mono text-xs break-all">{entry.in_iface}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Network Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Source</span>
                  <p className="font-mono text-sm">
                    {entry.src_ip}:{entry.src_port}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Destination</span>
                  <p className="font-mono text-sm">
                    {entry.dest_ip}:{entry.dest_port}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Specific Information */}
          {(entry.tls || entry.dns || entry.quic || entry.alert) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {entry.tls && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">TLS Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">SNI</span>
                        <p className="text-sm">{entry.tls.sni}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Version</span>
                        <p className="text-sm">{entry.tls.version}</p>
                      </div>
                    </div>
                    {entry.tls.ja3 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">JA3 Hash</span>
                        <p className="font-mono text-xs bg-muted p-2 rounded break-all">{entry.tls.ja3.hash}</p>
                      </div>
                    )}
                  </div>
                )}

                {entry.dns && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">DNS Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Type</span>
                        <p className="text-sm">{entry.dns.type}</p>
                      </div>
                      {entry.dns.rrname && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Query</span>
                          <p className="text-sm">{entry.dns.rrname}</p>
                        </div>
                      )}
                    </div>
                    {entry.dns.answers && entry.dns.answers.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Answers</span>
                        <div className="mt-1 space-y-1">
                          {entry.dns.answers.map((answer, index) => (
                            <p key={index} className="text-xs">
                              {answer.rrname} ({answer.rrtype}): {answer.rdata}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {entry.alert && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Alert Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Severity</span>
                        <p className="text-sm">{entry.alert.severity}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Category</span>
                        <p className="text-sm">{entry.alert.category}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Signature</span>
                      <p className="text-sm bg-muted p-2 rounded">{entry.alert.signature}</p>
                    </div>
                  </div>
                )}

                {entry.quic && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">QUIC Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Version</span>
                        <p className="text-sm">{entry.quic.version}</p>
                      </div>
                      {entry.quic.sni && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">SNI</span>
                          <p className="text-sm">{entry.quic.sni}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Raw JSON */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raw JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">{JSON.stringify(entry, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
