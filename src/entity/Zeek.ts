import {
  Entity,
  PrimaryGeneratedColumn,
  Column,

} from "typeorm";

@Entity()
export class Zeek {
  @PrimaryGeneratedColumn()
  id?: number;

  // @Column({ type: "text", nullable: true })
  // zeekId?: string;

  @Column({ type: "text", nullable: true })
  zeekTime?: string;

  @Column({ type: "text",  nullable: true })
  uid?: string;

  @Column({ type: "text",nullable: true })
  originIPAddress?: string;

  @Column({ type: "text", nullable: true})
  originPort?: string;

  @Column({ type: "text", nullable: true})
  internalDeviceIPAddress?: string;

  
  @Column({ type: "text", nullable: true})
  internalDevicePort?: string;

  @Column({ type: "text", nullable: true})
  protocol?: string;

  @Column({ type: "text",  nullable: true})
  service?: string;

  @Column({ type: "double",  nullable: true})
  duration?: number;

  @Column({ type: "text", nullable: true})
  originBytes?: string;

  @Column({ type: "text", nullable: true})
  respBytes?: string;

  @Column({ type: "text", nullable: true})
  connectionState?: string;

  @Column({ type: "text", nullable: true})
  localOrigin?: string;

  @Column({ type: "text", nullable: true})
  localResp?: string;

  @Column({ type: "text", nullable: true})
  missedByte?: string;

  @Column({ type: "text", nullable: true })
  history?: string;

  @Column({ type: "text", nullable: true})
  originPackets?: string;

  @Column({ type: "text", nullable: true})
  originIPBytes?: string;

  @Column({ type: "text", nullable: true})
  responsePackets?: string;

  @Column({ type: "text", nullable: true})
  responseIPBytes?: string;

  @Column({ type: "text", nullable: true })
  tunnelParents?: string;
  
  @Column({ type: "int", nullable:true })
  companyId?: number;
}
